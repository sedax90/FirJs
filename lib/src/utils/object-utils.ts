export default function deepMerge<T>(target: T | Partial<T>, newValues: T | Partial<T>): T {
    if (!isRecord(target) || !isRecord(newValues)) {
        return null as T;
    }

    let output = Object.assign({}, target);

    for (let key in newValues) {
        const value = newValues[key];

        if (isRecord(newValues[key])) {
            if (!(key in target)) {
                Object.assign(output, { [key]: value });
            }
            else {
                output[key] = deepMerge(target[key], value);
            }
        }
        else {
            if (Array.isArray(value)) {
                if (!output[key]) {
                    Object.assign(output, { [key]: value });
                }

                const outputValue = output[key] as Record<string, unknown>;

                for (let i = 0; i < value.length; i++) {
                    if (outputValue[i] && isRecord(outputValue[i]) && isRecord(value[i])) {
                        outputValue[i] = deepMerge(outputValue[i], value[i]);
                    }
                    else {
                        outputValue[i] = value[i];
                    }
                }
            }
            else {
                Object.assign(output, { [key]: value });
            }
        }
    }

    return output as T;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}