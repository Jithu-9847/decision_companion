/**
 * simple Random Forest Implementation
 */

// Calculate impurity (Entropy) of a set of labels
function calculateEntropy(labels) {
    if (labels.length === 0) return 0;
    const counts = {};
    for (const label of labels) {
        counts[label] = (counts[label] || 0) + 1;
    }
    let entropy = 0;
    for (const key in counts) {
        const p = counts[key] / labels.length;
        if (p > 0) entropy -= p * Math.log2(p);
    }
    return entropy;
}

// Calculate Information Gain of splitting a dataset by a specific categorical feature
function calculateInformationGain(dataset, feature) {
    const totalEntropy = calculateEntropy(dataset.map(d => d.label));

    // Group by feature value
    const subsets = {};
    for (const d of dataset) {
        const val = d.features[feature];
        if (!subsets[val]) subsets[val] = [];
        subsets[val].push(d);
    }

    let remainderEntropy = 0;
    for (const val in subsets) {
        const subset = subsets[val];
        const weight = subset.length / dataset.length;
        remainderEntropy += weight * calculateEntropy(subset.map(d => d.label));
    }

    return totalEntropy - remainderEntropy;
}

// A simple Decision Tree node
class Node {
    constructor() {
        this.isLeaf = false;
        this.prediction = null;
        this.splitFeature = null;
        this.children = {}; // featureValue -> Node
    }
}

class DecisionTree {
    constructor(maxDepth) {
        this.maxDepth = maxDepth;
        this.root = null;
    }

    train(dataset, availableFeatures, depth = 0) {
        this.root = this._buildTree(dataset, availableFeatures, depth);
    }

    _buildTree(dataset, availableFeatures, depth) {
        const node = new Node();

        const labels = dataset.map(d => d.label);
        const uniqueLabels = [...new Set(labels)];

        // Stopping criteria
        if (uniqueLabels.length === 1 || availableFeatures.length === 0 || depth >= this.maxDepth || dataset.length < 2) {
            node.isLeaf = true;
            node.prediction = this._mostCommon(labels);
            return node;
        }

        // Find best split
        let bestGain = -1;
        let bestFeature = null;

        for (const feature of availableFeatures) {
            const gain = calculateInformationGain(dataset, feature);
            if (gain > bestGain) {
                bestGain = gain;
                bestFeature = feature;
            }
        }

        // if no gain, make a leaf
        if (bestGain <= 0 || !bestFeature) {
            node.isLeaf = true;
            node.prediction = this._mostCommon(labels);
            return node;
        }

        node.splitFeature = bestFeature;

        // Group by best feature
        const subsets = {};
        for (const d of dataset) {
            const val = d.features[bestFeature];
            if (!subsets[val]) subsets[val] = [];
            subsets[val].push(d);
        }

        const remainingFeatures = availableFeatures.filter(f => f !== bestFeature);

        for (const val in subsets) {
            node.children[val] = this._buildTree(subsets[val], remainingFeatures, depth + 1);
        }

        return node;
    }

    _mostCommon(labels) {
        const counts = {};
        let maxCount = 0;
        let mostCommon = null;
        for (const label of labels) {
            counts[label] = (counts[label] || 0) + 1;
            if (counts[label] > maxCount) {
                maxCount = counts[label];
                mostCommon = label;
            }
        }
        return mostCommon;
    }

    predict(features) {
        return this._traverse(this.root, features);
    }

    _traverse(node, features) {
        if (!node) return null;
        if (node.isLeaf) return node.prediction;

        const val = String(features[node.splitFeature]);

        // If we have a child for this value, go down
        if (node.children[val]) {
            return this._traverse(node.children[val], features);
        } else {
            // Missing or unknown branch, fall back to leaf-like behavior (pick most common across all children)
            // For simplicity, we just return the first available child's prediction
            const keys = Object.keys(node.children);
            if (keys.length > 0) {
                return this._traverse(node.children[keys[0]], features);
            }
            return null;
        }
    }
}

class RandomForest {
    constructor(numTrees = 10, maxDepth = 5) {
        this.numTrees = numTrees;
        this.maxDepth = maxDepth;
        this.trees = [];
    }

    train(dataset, allFeatures) {
        this.trees = [];

        for (let i = 0; i < this.numTrees; i++) {
            // Bootstrap sampling
            const sampleSize = Math.floor(dataset.length * 0.8);
            const dataSample = [];
            for (let j = 0; j < sampleSize; j++) {
                dataSample.push(dataset[Math.floor(Math.random() * dataset.length)]);
            }

            // Feature subsampling (random subset of features for this tree)
            const numFeatures = Math.max(2, Math.floor(Math.sqrt(allFeatures.length)));
            const shuffledFeatures = [...allFeatures].sort(() => 0.5 - Math.random());
            const featureSubset = shuffledFeatures.slice(0, numFeatures);

            const tree = new DecisionTree(this.maxDepth);
            tree.train(dataSample, featureSubset);
            this.trees.push(tree);
        }
    }

    predict(features) {
        const votes = {};
        for (const tree of this.trees) {
            const pred = tree.predict(features);
            if (pred) {
                votes[pred] = (votes[pred] || 0) + 1;
            }
        }

        let bestPred = null;
        let maxVotes = 0;
        for (const pet in votes) {
            if (votes[pet] > maxVotes) {
                maxVotes = votes[pet];
                bestPred = pet;
            }
        }

        return {
            recommendation: bestPred,
            confidence: maxVotes / this.numTrees
        };
    }
}

module.exports = {
    RandomForest,
    calculateInformationGain,
    calculateEntropy
};
