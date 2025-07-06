import { Routes, Route } from 'react-router-dom'

export default function WebRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div>Web Dashboard (TODO)</div>} />
      <Route path="/projects/:id" element={<div>Web Project Management (TODO)</div>} />
      <Route path="/projects/:projectId/folders/:folderId" element={<div>Web Folder View (TODO)</div>} />
      <Route path="/search" element={<div>Web Search (TODO)</div>} />
      <Route path="/user" element={<div>Web User Profile (TODO)</div>} />
    </Routes>
  )
} 