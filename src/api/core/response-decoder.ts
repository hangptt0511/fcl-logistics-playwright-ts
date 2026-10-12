import { gunzipSync } from "zlib";
import { decode } from "@msgpack/msgpack";

/**
 * Chịu trách nhiệm giải mã (decode) response body trả về từ API
 * Xử lý theo thứ tự ưu tiên: GZIP → MessagePack → JSON → raw text
 */
export class ResponseDecoder {

    static async decode(buffer: Buffer, contentType: string): Promise<unknown> {
        const decompressed = this.tryGunzip(buffer);

        // Nếu API trả về MessagePack, decode rồi parse thêm JSON nếu cần
        if (contentType.includes("application/x-msgpack")) {
            return this.decodeMsgpack(decompressed);
        }

        // Mặc định: xử lý như JSON, fallback về raw text nếu không parse được
        return this.decodeJson(decompressed);
    }

    /**
     * Giải nén GZIP nếu buffer có magic bytes 0x1f 0x8b
     * Lưu ý: API có thể khai báo Content-Type là application/x-msgpack
     * nhưng thực tế body vẫn bị nén GZIP trước khi trả về
     */
    private static tryGunzip(buffer: Buffer): Buffer {
        const isGzipped = buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b;
        return isGzipped ? gunzipSync(buffer) : buffer;
    }

    /**
     * Decode MessagePack, sau đó thử parse JSON thêm 1 lần
     * vì có trường hợp API trả chuỗi MessagePack → string → JSON (double encode)
     */
    private static decodeMsgpack(buffer: Buffer): unknown {
        const decoded = decode(buffer);

        if (typeof decoded === "string") {
            return this.tryParseJson(decoded, decoded);
        }

        return decoded;
    }

    /**
     * Parse response dạng JSON thuần túy
     * Nếu body rỗng → trả về undefined
     * Nếu parse JSON thất bại → trả về nguyên văn text (không phải lỗi, có thể do API trả plain text)
     */
    private static decodeJson(buffer: Buffer): unknown {
        const text = buffer.toString("utf-8").trim();

        if (!text) {
            return undefined;
        }

        return this.tryParseJson(text, text);
    }

    /**
     * Helper dùng chung: thử parse JSON, fail thì trả về giá trị fallback
     */
    private static tryParseJson(text: string, fallback: unknown): unknown {
        try {
            return JSON.parse(text);
        } catch {
            return fallback;
        }
    }
}