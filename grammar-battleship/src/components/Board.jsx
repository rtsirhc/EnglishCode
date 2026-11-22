import { useState } from 'react';
import './Board.css';

/**
 * Board Component
 * @param {Object} axes - { x: string[], y: string[] }
 * @param {number[][]} grid - 2D Array where values represent state (0: empty, 1: ship, 2: hit, 3: miss)
 * @param {Function} onCellClick - (x, y) => void
 * @param {boolean} interactive - whether cells show hover effects
 * @param {Object} previewShip - { size, isHorizontal } used during setup phase for hover 
 */
export default function Board({ axes, grid, onCellClick, interactive = false, previewShip = null }) {
    const [hoverCoord, setHoverCoord] = useState(null); // {x, y}

    const width = axes.x.length;
    const height = axes.y.length;

    const handleMouseEnter = (x, y) => {
        if (interactive) {
            setHoverCoord({ x, y });
        }
    };

    const handleMouseLeave = () => {
        setHoverCoord(null);
    };

    // Helper to determine if a cell is being hovered by the preview ship
    const isPreviewCell = (x, y) => {
        if (!previewShip || !hoverCoord) return false;

        if (previewShip.isHorizontal) {
            return y === hoverCoord.y && x >= hoverCoord.x && x < hoverCoord.x + previewShip.size;
        } else {
            return x === hoverCoord.x && y >= hoverCoord.y && y < hoverCoord.y + previewShip.size;
        }
    };

    // Determine if preview placement is invalid (out of bounds)
    const isInvalidPreview = () => {
        if (!previewShip || !hoverCoord) return false;
        if (previewShip.isHorizontal) {
            return hoverCoord.x + previewShip.size > width;
        } else {
            return hoverCoord.y + previewShip.size > height;
        }
    };

    return (
        <div className="board-container">
            {/* Top Left Empty Corner */}
            <div className="board-corner"></div>

            {/* X-Axis headers (Subjects) */}
            <div className="board-header-x" style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}>
                {axes.x.map((subject, i) => (
                    <div key={i} className="axis-label x-label">{subject}</div>
                ))}
            </div>

            {/* Y-Axis headers (Past Participles) */}
            <div className="board-header-y" style={{ gridTemplateRows: `repeat(${height}, 1fr)` }}>
                {axes.y.map((participle, i) => (
                    <div key={i} className="axis-label y-label">{participle}</div>
                ))}
            </div>

            {/* The Grid */}
            <div className="board-grid" style={{
                gridTemplateColumns: `repeat(${width}, 1fr)`,
                gridTemplateRows: `repeat(${height}, 1fr)`
            }}>
                {grid.map((row, y) => (
                    row.map((cellValue, x) => {
                        const isHovered = isPreviewCell(x, y);
                        const invalid = isHovered && isInvalidPreview();

                        let cellClass = 'board-cell';
                        if (interactive) cellClass += ' interactive';

                        // Render specific states
                        if (cellValue === 1) cellClass += ' cell-ship';
                        if (cellValue === 2) cellClass += ' cell-hit';
                        if (cellValue === 3) cellClass += ' cell-miss'; // Miss or Dud

                        // Hover logic
                        if (isHovered && !invalid && cellValue === 0) cellClass += ' cell-preview';
                        if (isHovered && invalid) cellClass += ' cell-preview-invalid';
                        if (isHovered && !invalid && cellValue === 1) cellClass += ' cell-preview-invalid'; // Overlap

                        return (
                            <div
                                key={`${x}-${y}`}
                                className={cellClass}
                                onClick={() => onCellClick && onCellClick(x, y)}
                                onMouseEnter={() => handleMouseEnter(x, y)}
                                onMouseLeave={handleMouseLeave}
                            >
                                {cellValue === 2 && <div className="hit-marker">❌</div>}
                                {cellValue === 3 && <div className="miss-marker">💦</div>}
                            </div>
                        );
                    })
                ))}
            </div>
        </div>
    );
}
