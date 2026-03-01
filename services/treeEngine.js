const inquirer = require('inquirer');

/**
 * Traverses the decision tree interactively with the user.
 * @param {Object} tree - The decision tree.
 * @returns {Object} The final decision result and the path taken.
 */
async function traverseTree(tree) {
    let currentNode = tree;
    const userAnswers = [];
    let questionNumber = 1;

    while (currentNode && !currentNode.result) {
        // Prepare choices for inquirer
        const choices = Object.keys(currentNode.options).map(key => ({
            name: `${questionNumber}. ${currentNode.options[key].text}`,
            value: key
        }));

        // Ask the current question
        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedOption',
                message: `Question ${questionNumber}:\n${currentNode.question}`,
                choices: choices,
            }
        ]);

        const selectedKey = answer.selectedOption;
        const selectedOption = currentNode.options[selectedKey];

        // Store the answer
        userAnswers.push({
            question: currentNode.question,
            answer: selectedOption.text
        });

        // Move to the next node or result
        if (selectedOption.result) {
            return {
                result: selectedOption.result,
                path: userAnswers
            };
        } else if (selectedOption.next) {
            currentNode = selectedOption.next;
            questionNumber++;
        } else {
            throw new Error("Invalid tree structure: No result or next node found.");
        }
    }

    return null;
}

module.exports = {
    traverseTree
};
