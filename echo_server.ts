async function main() {
  const listener = Deno.listen("tcp", "127.0.0.1:8888")

  const conn = await listener.accept();

  const buffer = new Uint8Array(1024)

  const {eof, nread} = await conn.read(buffer)

  await conn.write(buffer.slice(0, nread))

  conn.close()
}

main()
