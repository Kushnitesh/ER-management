# 🏥 Emergency Room Patient Management System

An interactive, web-based Emergency Room Patient Management System that simulates hospital patient prioritization using a **Priority Queue (Max Heap)** data structure. Built with vanilla HTML, CSS, and JavaScript.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Vanilla JS](https://img.shields.io/badge/Vanilla--JS-100%25-yellow)
![Data Structure](https://img.shields.io/badge/Data%20Structure-Max%20Heap-green)

---

## 🌟 Key Features

1. **Patient Registration**:
   - Register patients with Name, Age, Gender, Emergency Type, and Severity (1 to 5).
   - Automatically tracks arrival timestamp.

2. **Priority Levels**:
   - `5` - **Critical** 🔴
   - `4` - **Very Urgent** 🟠
   - `3` - **Urgent** 🟡
   - `2` - **Moderate** 🔵
   - `1` - **Low Priority** 🟢
   - *Tie-breaker*: Patients with identical severity are treated based on earliest arrival time.

3. **Visual Waiting Queue & Highlights**:
   - Queue sorted automatically by emergency severity.
   - Top-priority patient highlighted with **"NEXT TO BE TREATED"**.

4. **Interactive Heap Tree Visualizer**:
   - Dynamic SVG visualization of the underlying Max Heap data structure showing parent-child node relationships.

5. **Treatment History & Real-Time Stats**:
   - Tracks total, waiting, critical, and treated patient counts.
   - Comprehensive treatment history log.

6. **Simulation Mode**:
   - One-click **"Add Demo Patients"** feature for presentations and demonstrations.

---

## 📊 Data Structure & Complexity

| Operation | Method | Complexity | Explanation |
|---|---|---|---|
| **Insert Patient** | `insert()` | $O(\log n)$ | Element is added at the bottom and bubbles up to maintain Max Heap property. |
| **Treat Next Patient** | `extractMax()` | $O(\log n)$ | Root node is extracted and heap property is restored via `sinkDown()`. |
| **Peek Next** | `peek()` | $O(1)$ | Accesses the highest priority patient at index 0. |

---

## 🛠️ Tech Stack

- **HTML5**: Structural semantic markup
- **CSS3**: Custom variables, Flexbox/Grid, Keyframe animations, Responsive design
- **Vanilla JavaScript (ES6+)**: Custom Max Heap class implementation & DOM manipulation

---

## 🚀 Getting Started

Simply open `index.html` in any web browser or serve locally:

```bash
# Clone the repository
git clone https://github.com/Kushnitesh/ER-management.git

# Navigate to directory
cd ER-management

# Open index.html in your browser or run a simple local server
npx http-server . -p 8080
```

---

## 📸 Presentation Walkthrough

1. Click **"Add Demo Patients"** to load pre-configured test cases:
   - **Priya** (Severity 5) ➔ **Neha** (Severity 4) ➔ **Aman** (Severity 3) ➔ **Rahul** (Severity 2) ➔ **Rohan** (Severity 1)
2. Click **"Treat Next Patient"** to process the root patient.
3. Observe real-time updates across the dashboard, heap tree, and treatment history.
