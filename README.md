# 🌐 Irrigation Frontend

React-based dashboard for real-time monitoring of the irrigation system.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### 💻 Local Development
1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Start development server**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`. Make sure the **Gateway Service** is running on port 8080.

### 🐋 Method: Docker
Build and run the frontend using Docker:
```bash
docker build -t irrigation-frontend .
docker run -p 3000:80 irrigation-frontend
```

### ☸️ Method: Kubernetes
Apply the manifest from the `k8s/` directory:
```bash
kubectl apply -f k8s/frontend.yaml
```

---

## 🛠️ Tech Stack
- **Framework**: React + Vite
- **Styling**: TailwindCSS
- **API Client**: Axios (Proxied through Nginx in production)
- **Containerization**: Docker (Nginx target)
