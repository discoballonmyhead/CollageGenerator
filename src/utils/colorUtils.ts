export interface RGB {
    r: number;
    g: number;
    b: number;
}

export function getAverageColor(
    imageData: ImageData,
    sx = 0,
    sy = 0,
    sw = imageData.width,
    sh = imageData.height
): RGB {
    const { data, width } = imageData;
    let r = 0,
        g = 0,
        b = 0;
    let count = 0;

    for (let y = sy; y < sy + sh; y++) {
        for (let x = sx; x < sx + sw; x++) {
            const index = (y * width + x) * 4;
            r += data[index];
            g += data[index + 1];
            b += data[index + 2];
            count++;
        }
    }

    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
    };
}

export function colorDistance(c1: RGB, c2: RGB): number {
    return Math.sqrt(
        Math.pow(c1.r - c2.r, 2) +
        Math.pow(c1.g - c2.g, 2) +
        Math.pow(c1.b - c2.b, 2)
    );
}


export function computeHistogram(imageData: ImageData): number[] { // to understand the pixel histogram, undertanding the pixel shape// need to define this more in the future to work with the shape
    const { data } = imageData;
    const histogram = new Array(256).fill(0);

    for (let i = 0; i < data.length; i += 4) {
        const luminance = Math.round(
            0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        );
        histogram[luminance]++;
    }
    const totalPixels = imageData.width * imageData.height;
    return histogram.map((value) => value / totalPixels);
}

export function histogramDistance(h1: number[], h2: number[]): number {
    // Using chi-squared distance or any other suitable metric
    let distance = 0;
    for (let i = 0; i < h1.length; i++) {
        if (h1[i] + h2[i] !== 0) {
            distance += ((h1[i] - h2[i]) ** 2) / (h1[i] + h2[i]);
        }
    }
    return distance;
}
