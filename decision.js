const { runTravelEngine } = require('./services/travelEngine');

async function main() {
    console.log("=========================================");
    console.log("   Welcome to You one and only decision companion");
    console.log("=========================================\n");

    try {
        await runTravelEngine();
    } catch (error) {
        console.error(`\nSystem Error: ${error.message}`);
    }

    console.log("\nExiting decision companion...");
    process.exit(0);
}

// Start application
if (require.main === module) {
    main();
}

module.exports = { main };
