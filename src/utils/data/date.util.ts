import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/** Tên thứ bằng tiếng Anh, khớp với dữ liệu hệ thống (vd: weekdays: "Tuesday") */
export type Weekday = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

/** Chỉ số thứ theo dayjs: Chủ nhật = 0 ... Thứ bảy = 6 */
const WEEKDAY_INDEX: Record<Weekday, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

export interface WeekdayOptions {
  /** 'next': thứ đó sắp tới (mặc định); 'previous': thứ đó gần nhất trong quá khứ */
  direction?: 'next' | 'previous';
  /** Hôm nay đúng thứ cần tìm: true -> trả về hôm nay; false (mặc định) -> tuần kế tiếp/tuần trước */
  includeToday?: boolean;
  format?: string;
  tz?: string;
}

export class DateUtil {
  private static DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';
  private static DEFAULT_FORMAT = 'YYYY-MM-DD';
  public static readonly FORMAT_ISO = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';
  /** Định dạng ngày nhập trên giao diện ứng dụng (dd/MM/yyyy theo kiểu dayjs) */
  public static readonly FORMAT_APP = 'DD/MM/YYYY';
  public static readonly FORMAT_DATETIME_APP = 'DD/MM/YYYY HH:00';

  /**
   * Chặn định dạng viết theo kiểu date-fns/Java: dayjs không có token `yyyy` (in nguyên văn)
   * và `dd` là tên thứ viết tắt, nên 'dd/MM/yyyy' ra kết quả như 'Tu/10/yyyy'.
   */
  private static assertFormat(format: string): string {
    const withoutLiterals = format.replace(/\[[^\]]*\]/g, ''); // bỏ phần chữ trong [...]
    if (/y|(?<!d)dd(?!d)/.test(withoutLiterals)) {
      throw new Error(`Định dạng ngày "${format}" không đúng với dayjs: dùng YYYY thay yyyy, DD thay dd`);
    }
    return format;
  }

  /**
   * Lấy ngày hiện tại theo định dạng và múi giờ mong muốn
   * @param format Định dạng đầu ra (Default: 'YYYY-MM-DD'). Lưu ý token của dayjs: YYYY, MM, DD (viết hoa)
   * @param tz Múi giờ (Default: 'Asia/Ho_Chi_Minh')
   */
  static getCurrentDate(format: string = this.DEFAULT_FORMAT, tz: string = this.DEFAULT_TIMEZONE): string {
    return dayjs().tz(tz).format(DateUtil.assertFormat(format));
  }

  /**
   * Lấy ngày tương lai hoặc quá khứ (Dùng cho effectiveDate, expDate...)
   * @param offsetDays Số ngày cộng thêm (dương) hoặc trừ đi (âm)
   * @param format Định dạng đầu ra
   * @param tz Múi giờ (Default: 'Asia/Ho_Chi_Minh'), cùng múi giờ với getCurrentDate để hai hàm không lệch nhau
   */
  static getRelativeDate(
    offsetDays: number,
    format: string = this.DEFAULT_FORMAT,
    tz: string = this.DEFAULT_TIMEZONE,
  ): string {
    return dayjs().tz(tz).add(offsetDays, 'day').format(DateUtil.assertFormat(format));
  }

  /**
   * Lấy ngày của một thứ cụ thể trong tuần gần nhất (vd: "thứ Ba sắp tới").
   * Ví dụ (hôm nay là thứ Ba 06/10/2026):
   *   getDateByWeekday('Tuesday')                           -> thứ Ba tuần sau (13/10)
   *   getDateByWeekday('Tuesday', { includeToday: true })   -> hôm nay (06/10)
   *   getDateByWeekday('Friday')                            -> thứ Sáu sắp tới (09/10)
   *   getDateByWeekday('Monday', { direction: 'previous' }) -> thứ Hai gần nhất đã qua (05/10)
   */
  static getDateByWeekday(weekday: Weekday, options: WeekdayOptions = {}): string {
    const {
      direction = 'next',
      includeToday = false,
      format = this.DEFAULT_FORMAT,
      tz = this.DEFAULT_TIMEZONE,
    } = options;

    const now = dayjs().tz(tz);
    const target = WEEKDAY_INDEX[weekday];
    const current = now.day();

    // Khoảng cách (số ngày) theo chiều tìm kiếm, trong khoảng 0..6
    const distance = direction === 'next' ? (target - current + 7) % 7 : (current - target + 7) % 7;
    // distance = 0 nghĩa là hôm nay đúng thứ cần tìm
    const days = distance === 0 && !includeToday ? 7 : distance;

    return (direction === 'next' ? now.add(days, 'day') : now.subtract(days, 'day')).format(DateUtil.assertFormat(format));
  }
}