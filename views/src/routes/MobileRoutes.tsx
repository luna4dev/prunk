import { Routes, Route } from 'react-router-dom'

export default function MobileRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div>Mobile Project List (TODO)</div>} />
      <Route path="/projects/:id" element={<div>Mobile Project Detail (TODO)</div>} />
      <Route path="/projects/:projectId/folders/:folderId" element={<div>Mobile Folder Detail (TODO)</div>} />
      <Route path="/search" element={<div>Mobile Search (TODO)</div>} />
      <Route path="/user" element={<div>Mobile User Profile (TODO)</div>} />
    </Routes>
  )
} 