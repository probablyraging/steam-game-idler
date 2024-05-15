const fs = require('fs');
const path = require('path');

function copyDirectory(source, destination) {
    fs.mkdirSync(destination, { recursive: true });

    const files = fs.readdirSync(source);

    for (const file of files) {
        const sourcePath = path.join(source, file);
        const destinationPath = path.join(destination, file);

        const stats = fs.statSync(sourcePath);

        if (stats.isDirectory()) {
            copyDirectory(sourcePath, destinationPath);
        } else {
            fs.copyFileSync(sourcePath, destinationPath);
        }
    }
}

// Example usage
const sourceDir = './steam';
const destinationDir = './dist/win-unpacked/steam';

try {
    copyDirectory(sourceDir, destinationDir);
    console.log('Directory copied successfully!');
} catch (error) {
    console.error('Error copying directory:', error);
}

// git add ./dist/win-unpacked/steam-game-idler-1.0.0.zip -f