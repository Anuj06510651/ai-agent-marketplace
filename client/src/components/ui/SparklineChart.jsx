export default function SparklineChart({ data, color = '#3b82f6', height = 60, width = 200 }) {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const padding = 4;

    const points = data
        .map((val, i) => {
            const x = padding + (i / (data.length - 1)) * (width - padding * 2);
            const y = padding + (1 - (val - min) / range) * (height - padding * 2);
            return `${x},${y}`;
        })
        .join(' ');

    // Create fill area (close the polygon at the bottom)
    const fillPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full"
            style={{ height: `${height}px` }}
            preserveAspectRatio="none"
        >
            <defs>
                <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.01" />
                </linearGradient>
            </defs>
            {/* Fill area */}
            <polygon
                points={fillPoints}
                fill={`url(#gradient-${color.replace('#', '')})`}
            />
            {/* Line */}
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sparkline-path"
            />
        </svg>
    );
}
