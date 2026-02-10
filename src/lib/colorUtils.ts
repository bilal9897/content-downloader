export async function getDominantColor(imageUrl: string): Promise<string | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                resolve(null);
                return;
            }

            canvas.width = 1;
            canvas.height = 1;

            // Draw the image resized to 1x1 to get average color
            try {
                ctx.drawImage(img, 0, 0, 1, 1);
                const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

                // Boost vibrancy for the neon aesthetic
                // Convert to HSL, boost saturation/lightness, convert back? 
                // Or just a simple boost:
                const boost = (val: number) => Math.min(255, Math.floor(val * 1.5));
                const brightR = boost(r);
                const brightG = boost(g);
                const brightB = boost(b);

                resolve(`rgb(${brightR}, ${brightG}, ${brightB})`);
            } catch (e) {
                // Likely CORS issue
                console.warn("Could not extract color due to CORS or other error", e);
                resolve(null);
            }
        };

        img.onerror = () => resolve(null);
    });
}
