export async function* streamToAsyncIterable(stream: ReadableStream<Uint8Array> | null) {
	if (!stream) return null;
	const reader = stream.getReader();
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) return;
			yield value;
		}
	} finally {
		reader.releaseLock();
	}
}