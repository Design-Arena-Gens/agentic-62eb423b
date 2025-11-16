import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createDemoVm, progressDemoVm, VMRecord } from '@/lib/providers/mockProvider';
import { hasAwsCreds, createWindowsInstance, getInstancePublicIp, terminateInstance } from '@/lib/providers/awsProvider';

// We persist demo VMs in a signed cookie (stateless, Vercel-safe). Real providers are fetched live.
const COOKIE_NAME = 'demo-vms';

function readDemoVms(): VMRecord[] {
  const store = cookies().get(COOKIE_NAME)?.value;
  if (!store) return [];
  try {
    const list = JSON.parse(store) as VMRecord[];
    return list.map(progressDemoVm);
  } catch {
    return [];
  }
}

function writeDemoVms(vms: VMRecord[]) {
  cookies().set(COOKIE_NAME, JSON.stringify(vms.map(progressDemoVm)), {
    httpOnly: false,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 3, // 3 days
  });
}

export async function GET() {
  const vms = readDemoVms();
  return NextResponse.json({ vms: vms.map(progressDemoVm) });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const provider = (body.provider as string) || 'demo';

  if (provider === 'aws') {
    if (!hasAwsCreds()) {
      return NextResponse.json({ error: 'AWS credentials not configured. Using demo mode instead.' }, { status: 400 });
    }
    const region = (body.region as string) || 'us-east-1';
    const instanceType = (body.instanceType as string) || 't3.large';
    const windowsVersion = (body.windowsVersion as string) || 'Windows_Server-2022-English-Full-Base';

    try {
      const { instanceId } = await createWindowsInstance({ region, instanceType, windowsVersion });
      // Do not store in cookie; client will poll separately in a real app. For simplicity, mirror into cookie list for UI.
      const list = readDemoVms();
      list.push({
        id: instanceId,
        provider: 'demo', // show in UI; we keep demo schema for simplicity
        region,
        instanceType,
        windowsVersion,
        state: 'pending',
        username: 'Administrator',
        createdAt: Date.now(),
      });
      writeDemoVms(list);
      return NextResponse.json({ id: instanceId });
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Failed to create AWS instance' }, { status: 500 });
    }
  }

  // Demo provider
  const vm = createDemoVm({ region: body.region, instanceType: body.instanceType, windowsVersion: body.windowsVersion });
  const list = readDemoVms();
  list.push(vm);
  writeDemoVms(list);
  return NextResponse.json({ id: vm.id });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  // If looks like an AWS instance id (i-...), attempt termination when creds present
  if (id.startsWith('i-') && hasAwsCreds()) {
    const list = readDemoVms();
    const region = list.find(v => v.id === id)?.region || 'us-east-1';
    try {
      await terminateInstance(region, id);
    } catch (e) {
      // ignore failures
    }
  }

  const list = readDemoVms().map(progressDemoVm);
  const updated = list.map(v => (v.id === id ? { ...v, state: 'terminated' as const } : v));
  writeDemoVms(updated);
  return NextResponse.json({ ok: true });
}
