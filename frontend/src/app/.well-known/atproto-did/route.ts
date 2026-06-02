export async function GET() {
  return new Response('did:plc:bld6yewhjghsgs3f4hwcajgf', {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}