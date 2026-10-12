import forge from 'node-forge';

/**
 * Tiện ích mã hóa RSA phía test, dùng để mã hóa mật khẩu trước khi gọi API đăng nhập.
 */
export class RsaCryptoHelper {
  /**
   * Mã hóa mật khẩu bằng RSA public key
   *
   * Thuật toán: RSA với padding PKCS#1 v1.5, kết quả trả về dạng Base64.
   *
   * Lưu ý: PKCS#1 v1.5 chèn dữ liệu ngẫu nhiên khi mã hóa, nên cùng một mật khẩu
   * sẽ cho ra chuỗi khác nhau mỗi lần gọi. Không dùng kết quả để so sánh bằng nhau
   * trong assertion.
   *
   * @param rawPassword Mật khẩu gốc chưa mã hóa
   * @param publicKeyPem RSA public key dạng chuỗi PEM
   * @returns Mật khẩu đã mã hóa, định dạng Base64
   * @throws Error nếu thiếu tham số hoặc key không hợp lệ
   */
  public static encode(rawPassword: string, publicKeyPem: string): string {
    // Chặn sớm đầu vào rỗng để báo lỗi rõ ràng, thay vì để thư viện báo lỗi khó hiểu
    if (!rawPassword || !publicKeyPem) {
      throw new Error('Password hoặc Public Key không được để rỗng!');
    }

    try {
      // Bước 1: chuyển chuỗi PEM thành đối tượng public key mà node-forge dùng được
      const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

      // Bước 2: mã hóa RSA với padding PKCS#1 v1.5
      const encryptedBytes = publicKey.encrypt(rawPassword, 'RSAES-PKCS1-V1_5');

      // Bước 3: kết quả là chuỗi byte thô, đổi sang Base64 để truyền qua HTTP/JSON
      return forge.util.encode64(encryptedBytes);
    } catch (error) {
      // Bọc lỗi gốc kèm tiền tố rõ nghĩa. Thông báo lỗi không chứa mật khẩu
      // nên không làm lộ dữ liệu nhạy cảm vào log
      throw new Error(`Lỗi mã hóa RSA Password: ${(error as Error).message}`);
    }
  }
}