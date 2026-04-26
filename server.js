const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
// Serve static files (HTML, CSS, JS, images) from current directory
app.use(express.static(__dirname));

const FEEDBACK_FILE = path.join(__dirname, 'feedback.json');

// ---------- FEEDBACK FUNCTIONS ----------
function readFeedback() {
    try {
        if (!fs.existsSync(FEEDBACK_FILE)) {
            const initial = [
                { id: 1, name: "Rahul Sharma", role: "Student", rating: 5, text: "Found a verified PG within 2km of my college in just 2 days. No brokerage, no hassle. Highly recommended!", date: new Date().toISOString() },
                { id: 2, name: "Priya Patil", role: "Student", rating: 4.5, text: "The map feature is a lifesaver! I could see exactly which rooms were available near my college. Saved so much time.", date: new Date().toISOString() },
                { id: 3, name: "Mahesh Patil", role: "Property Owner", rating: 5, text: "Very easy to list my rooms and connect with students. The verification process gave tenants confidence.", date: new Date().toISOString() },
                { id: 4, name: "Sneha Joshi", role: "Student", rating: 5, text: "Zero brokerage is real! I saved ₹15,000 compared to what brokers were asking. The chat feature is very secure.", date: new Date().toISOString() }
            ];
            fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(initial, null, 2));
            console.log("Created feedback.json with sample data.");
            return initial;
        }
        const data = fs.readFileSync(FEEDBACK_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("READ ERROR:", err);
        return [];
    }
}

function writeFeedback(data) {
    try {
        fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
        console.log("Feedback saved successfully");
    } catch (err) {
        console.error("WRITE ERROR:", err);
    }
}

// ---------- API ROUTES ----------
app.get('/api/feedback', (req, res) => {
    const feedback = readFeedback();
    res.json(feedback);
});

app.post('/api/feedback', (req, res) => {
    const { name, role, rating, text } = req.body;
    if (!name || !rating || !text) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    const feedback = readFeedback();
    const newFeedback = {
        id: Date.now(),
        name: name.trim(),
        role: role || 'Student',
        rating: parseFloat(rating),
        text: text.trim(),
        date: new Date().toISOString()
    };
    feedback.unshift(newFeedback);
    writeFeedback(feedback);
    res.status(201).json(newFeedback);
});

app.delete('/api/feedback/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { pwd } = req.query;
    if (pwd !== 'admin123') {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    let feedback = readFeedback();
    const newFeedback = feedback.filter(f => f.id !== id);
    if (feedback.length === newFeedback.length) {
        return res.status(404).json({ error: 'Not found' });
    }
    writeFeedback(newFeedback);
    res.json({ success: true });
});
// ---------- START SERVER ----------
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});