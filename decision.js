const { runDynamicSelector } = require('./services/dynamicEngine');

async function main() {
    console.log("=========================================");
    console.log("   Welcome to Offline Pet Selector");
    console.log("=========================================\n");

    try {
        await runDynamicSelector();
    } catch (error) {
        console.error(`\nSystem Error: ${error.message}`);
    }

    console.log("\nExiting Pet Selector...");
    process.exit(0);
}

// Start application
if (require.main === module) {
    main();
}

module.exports = { main };
