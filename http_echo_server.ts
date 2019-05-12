import { BufReader, BufWriter } from 'https://deno.land/std@v0.3.2/io/bufio.ts';

async function readLine(bufReader: BufReader): Promise<string> {
  const [line, ok, err] = await bufReader.readLine();
  if (!ok && err) {
    throw err;
  }
  return new TextDecoder().decode(line);
}

async function http_echo_server() {
  const listener = Deno.listen('tcp', '127.0.0.1:8888');
  console.log('http_echo_server litening on 8888');
  const conn = await listener.accept();

  const bufReader = new BufReader(conn);
  const bufWriter = new BufWriter(conn);
  const encoder = new TextEncoder();

  const requestLine = await readLine(bufReader);
  const [_, method, pathname, version] = requestLine.match(
    /^([^ ]+)? ([^ ]+?) ([^ ]+?)$/
  );

  let headerLine: string;
  const requestHeaders = new Headers();

  while ((headerLine = await readLine(bufReader)).length > 0) {
    const [key, value] = headerLine.split(':').map(s => s.trim());
    requestHeaders.set(key, value);
  }

  const contentLength = parseInt(requestHeaders.get('content-length'));
  const bodyBuf = new Uint8Array(contentLength);
  console.log(bodyBuf.byteLength);
  await bufReader.readFull(bodyBuf);

  await bufWriter.write(encoder.encode('HTTP/1.1 200 OK\r\n'));

  for (const [key, value] of requestHeaders.entries()) {
    await bufWriter.write(encoder.encode(`${key}: ${value}\r\n`));
  }

  await bufWriter.write(encoder.encode('\r\n'));

  await bufWriter.write(bodyBuf);
  await bufWriter.flush();

  conn.close();
}

http_echo_server();
