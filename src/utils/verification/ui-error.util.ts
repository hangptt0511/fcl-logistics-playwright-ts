import { ExpectedFieldError } from '@ui/models/fcl-booking.model';

export interface FieldErrorDiff {
    missing: string[];        // Kỳ vọng có lỗi nhưng UI không báo
    wrongMessage: string[];   // Có lỗi đúng field nhưng nội dung khác
}

export function diffFieldErrors(
    actual: ExpectedFieldError[],
    expected: ExpectedFieldError[]
): FieldErrorDiff {
    const actualMap = new Map(actual.map((e) => [e.label, e.message]));
    const expectedMap = new Map(expected.map((e) => [e.label, e.message]));

    const missing: string[] = [];
    const wrongMessage: string[] = [];
    for (const [label, message] of expectedMap) {
        if (!actualMap.has(label)) {
            missing.push(`${label} (kỳ vọng: "${message}")`);
        } else if (actualMap.get(label) !== message) {
            wrongMessage.push(`${label}: kỳ vọng "${message}" nhưng thực tế "${actualMap.get(label)}"`);
        }
    }

    return { missing, wrongMessage };
}