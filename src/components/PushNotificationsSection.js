import React, { useState, useEffect } from "react";
import CustomSelect from "./common/CustomSelect";

export default function PushNotificationsSection({ registeredPlayers = [] }) {
  // Custom Groups Management (using localStorage for persistence)
  const loadCustomGroups = () => {
    try {
      const stored = localStorage.getItem('notification_custom_groups');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  const saveCustomGroups = (groups) => {
    try {
      localStorage.setItem('notification_custom_groups', JSON.stringify(groups));
    } catch (e) {
      console.error('Failed to save groups:', e);
    }
  };

  const [customGroups, setCustomGroups] = useState(loadCustomGroups);

  // Update groups in localStorage whenever they change
  useEffect(() => {
    saveCustomGroups(customGroups);
  }, [customGroups]);

  // Group creation state
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: "",
    type: "player", // "player" or "staff"
    memberIds: []
  });
  const [groupMemberSearch, setGroupMemberSearch] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);

  // Mock staff data for staff groups
  const mockStaff = [
    { id: "ST001", name: "Sarah Johnson", role: "Dealer", email: "sarah@example.com" },
    { id: "ST002", name: "Mike Chen", role: "Cashier", email: "mike@example.com" },
    { id: "ST003", name: "Emma Davis", role: "Floor Manager", email: "emma@example.com" },
    { id: "ST004", name: "John Doe", role: "Dealer", email: "john@example.com" }
  ];

  // Get available members based on group type
  const getAvailableMembers = () => {
    if (groupForm.type === "player") {
      return registeredPlayers.filter(p =>
        !groupForm.memberIds.includes(p.id) &&
        (!groupMemberSearch ||
          p.name.toLowerCase().includes(groupMemberSearch.toLowerCase()) ||
          p.id.toLowerCase().includes(groupMemberSearch.toLowerCase()) ||
          p.email.toLowerCase().includes(groupMemberSearch.toLowerCase()))
      );
    } else {
      return mockStaff.filter(s =>
        !groupForm.memberIds.includes(s.id) &&
        (!groupMemberSearch ||
          s.name.toLowerCase().includes(groupMemberSearch.toLowerCase()) ||
          s.id.toLowerCase().includes(groupMemberSearch.toLowerCase()) ||
          s.email.toLowerCase().includes(groupMemberSearch.toLowerCase()))
      );
    }
  };

  // Handle create/update group
  const handleSaveGroup = () => {
    if (!groupForm.name.trim()) {
      alert("Please enter a group name");
      return;
    }
    if (groupForm.memberIds.length === 0) {
      alert("Please select at least one member for the group");
      return;
    }

    if (editingGroup) {
      // Update existing group
      setCustomGroups(prev => prev.map(g =>
        g.id === editingGroup.id
          ? { ...g, name: groupForm.name, type: groupForm.type, memberIds: groupForm.memberIds }
          : g
      ));
      alert(`Group "${groupForm.name}" updated successfully!`);
    } else {
      // Create new group
      const newGroup = {
        id: `group-${Date.now()}`,
        name: groupForm.name,
        type: groupForm.type,
        memberIds: groupForm.memberIds,
        createdAt: new Date().toISOString()
      };
      setCustomGroups(prev => [...prev, newGroup]);
      alert(`Group "${groupForm.name}" created successfully!`);
    }

    // Reset form
    setGroupForm({ name: "", type: "player", memberIds: [] });
    setGroupMemberSearch("");
    setShowGroupForm(false);
    setEditingGroup(null);
  };

  // Handle delete group
  const handleDeleteGroup = (groupId) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      setCustomGroups(prev => prev.filter(g => g.id !== groupId));
      alert("Group deleted successfully!");
    }
  };

  // Handle edit group
  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      type: group.type,
      memberIds: [...group.memberIds]
    });
    setShowGroupForm(true);
  };

  // Get group members details
  const getGroupMembersDetails = (group) => {
    if (group.type === "player") {
      return group.memberIds.map(id => registeredPlayers.find(p => p.id === id)).filter(Boolean);
    } else {
      return group.memberIds.map(id => mockStaff.find(s => s.id === id)).filter(Boolean);
    }
  };

  // Get available audience options (including custom groups)
  const getAudienceOptions = () => {
    const standardOptions = [
      "All Players",
      "Tables in Play",
      "Waitlist",
      "VIP"
    ];
    const playerGroups = customGroups.filter(g => g.type === "player").map(g => `[Player Group] ${g.name}`);
    const staffGroups = customGroups.filter(g => g.type === "staff").map(g => `[Staff Group] ${g.name}`);
    return [...standardOptions, ...playerGroups, ...staffGroups];
  };

  // State for Push Notifications
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    audience: "All Players",
    imageFile: null,
    imageUrl: "",
    videoUrl: "",
    imagePreview: null
  });
  const [notificationErrors, setNotificationErrors] = useState({});

  // Validate image file
  const validateImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validTypes.includes(file.type)) return "Image must be JPG, PNG, GIF, or WebP format";
    if (file.size > maxSize) return "Image size must be less than 5MB";
    return null;
  };

  // Validate video URL
  const validateVideoUrl = (url) => {
    if (!url) return null;
    const videoUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|facebook\.com|instagram\.com)\/.+$/i;
    return videoUrlPattern.test(url) ? null : "Please enter a valid video URL (YouTube, Vimeo, DailyMotion, Facebook, Instagram)";
  };

  // Handle image file selection
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      setNotificationErrors(prev => ({ ...prev, image: error }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNotificationForm(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: reader.result,
        imageUrl: ""
      }));
      setNotificationErrors(prev => ({ ...prev, image: null }));
    };
    reader.readAsDataURL(file);
  };

  // Handle image URL input
  const handleImageUrlChange = (url) => {
    if (!url) {
      setNotificationForm(prev => ({ ...prev, imageUrl: "", imageFile: null, imagePreview: null }));
      setNotificationErrors(prev => ({ ...prev, image: null }));
      return;
    }
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(url)) {
      setNotificationErrors(prev => ({ ...prev, image: "Please enter a valid URL starting with http:// or https://" }));
      return;
    }
    setNotificationForm(prev => ({
      ...prev,
      imageUrl: url,
      imageFile: null,
      imagePreview: null
    }));
    setNotificationErrors(prev => ({ ...prev, image: null }));
  };

  // Handle video URL input
  const handleVideoUrlChange = (url) => {
    setNotificationForm(prev => ({ ...prev, videoUrl: url }));
    setNotificationErrors(prev => ({ ...prev, video: validateVideoUrl(url) }));
  };

  // Handle send notification
  const handleSendNotification = () => {
    const errors = {};
    if (!notificationForm.title.trim()) errors.title = "Title is required";
    if (!notificationForm.message.trim()) errors.message = "Message is required";
    if (notificationForm.imageFile && notificationForm.imageUrl) errors.image = "Use either image upload OR image URL, not both";
    if (notificationForm.videoUrl) {
      const v = validateVideoUrl(notificationForm.videoUrl);
      if (v) errors.video = v;
    }
    if (Object.keys(errors).length) {
      setNotificationErrors(errors);
      return;
    }

    const payload = {
      title: notificationForm.title,
      message: notificationForm.message,
      audience: notificationForm.audience,
      media: {}
    };
    if (notificationForm.imageFile) {
      payload.media.imageUrl = "https://api.example.com/uploads/" + notificationForm.imageFile.name;
    } else if (notificationForm.imageUrl) {
      payload.media.imageUrl = notificationForm.imageUrl;
    }
    if (notificationForm.videoUrl) payload.media.videoUrl = notificationForm.videoUrl;

    console.log("Sending notification payload:", payload);
    alert(`Notification sent!\nPayload: ${JSON.stringify(payload, null, 2)}`);
    setNotificationForm({ title: "", message: "", audience: "All Players", imageFile: null, imageUrl: "", videoUrl: "", imagePreview: null });
    setNotificationErrors({});
  };

  return (
    <div className="space-y-6">
      <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-pink-700/30 rounded-xl shadow-md border border-indigo-800/40">
        <h2 className="text-xl font-bold text-white mb-6">Push Notifications</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Compose Notification</h3>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm">Title</label>
                <input
                  type="text"
                  className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded text-white ${notificationErrors.title ? 'border-red-500' : 'border-white/20'
                    }`}
                  placeholder="Enter title"
                  value={notificationForm.title}
                  onChange={(e) => {
                    setNotificationForm({ ...notificationForm, title: e.target.value });
                    setNotificationErrors({ ...notificationErrors, title: null });
                  }}
                />
                {notificationErrors.title && (
                  <p className="text-red-400 text-xs mt-1">{notificationErrors.title}</p>
                )}
              </div>
              <div>
                <label className="text-white text-sm">Message</label>
                <textarea
                  className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded text-white ${notificationErrors.message ? 'border-red-500' : 'border-white/20'
                    }`}
                  rows="3"
                  placeholder="Enter message..."
                  value={notificationForm.message}
                  onChange={(e) => {
                    setNotificationForm({ ...notificationForm, message: e.target.value });
                    setNotificationErrors({ ...notificationErrors, message: null });
                  }}
                ></textarea>
                {notificationErrors.message && (
                  <p className="text-red-400 text-xs mt-1">{notificationErrors.message}</p>
                )}
              </div>
              <div>
                <label className="text-white text-sm">Audience</label>
                <CustomSelect
                  className="w-full"
                  value={notificationForm.audience}
                  onChange={(e) => setNotificationForm({ ...notificationForm, audience: e.target.value })}
                >
                  {getAudienceOptions().map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </CustomSelect>
              </div>

              {/* Image Section */}
              <div className="border-t border-white/20 pt-4">
                <label className="text-white text-sm font-semibold mb-2 block">Image (Optional)</label>
                <div className="space-y-3">
                  <div>
                    <label className="text-white text-xs">Upload Image</label>
                    <div className="mt-1 border-2 border-dashed border-white/30 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        className="hidden"
                        id="image-upload-push-notifications"
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="image-upload-push-notifications" className="cursor-pointer">
                        <div className="text-white text-sm mb-1">Click to upload or drag and drop</div>
                        <div className="text-gray-400 text-xs">JPG, PNG, GIF, WebP (max 5MB)</div>
                      </label>
                      {notificationForm.imagePreview && (
                        <div className="mt-3">
                          <img src={notificationForm.imagePreview} alt="Preview" className="max-h-32 mx-auto rounded" />
                          <button
                            type="button"
                            onClick={() => setNotificationForm({ ...notificationForm, imageFile: null, imagePreview: null })}
                            className="mt-2 text-red-400 text-xs hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-center text-white/60 text-xs">OR</div>
                  <div>
                    <label className="text-white text-xs">Image URL</label>
                    <input
                      type="url"
                      className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded text-white text-sm ${notificationErrors.image ? 'border-red-500' : 'border-white/20'
                        }`}
                      placeholder="https://example.com/image.jpg"
                      value={notificationForm.imageUrl}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                    />
                  </div>
                  {notificationErrors.image && (
                    <p className="text-red-400 text-xs">{notificationErrors.image}</p>
                  )}
                </div>
              </div>

              {/* Video Section */}
              <div className="border-t border-white/20 pt-4">
                <label className="text-white text-sm font-semibold mb-2 block">Video Link (Optional)</label>
                <input
                  type="url"
                  className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded text-white text-sm ${notificationErrors.video ? 'border-red-500' : 'border-white/20'
                    }`}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  value={notificationForm.videoUrl}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                />
                {notificationErrors.video && (
                  <p className="text-red-400 text-xs mt-1">{notificationErrors.video}</p>
                )}
                <p className="text-gray-400 text-xs mt-1">
                  Supported: YouTube, Vimeo, DailyMotion, Facebook, Instagram
                </p>
              </div>

              <button
                onClick={handleSendNotification}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold mt-4"
              >
                Send Notification
              </button>
            </div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Notifications</h3>
            <div className="space-y-2">
              {[{ title: 'Welcome Offer', time: '2h ago' }, { title: 'Table 2 starting soon', time: '10m ago' }].map(n => (
                <div key={n.title} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                  <div className="text-white">{n.title}</div>
                  <div className="text-white/60 text-sm">{n.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Custom Groups Management */}
      <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Custom Notification Groups</h2>
          <button
            onClick={() => {
              setShowGroupForm(true);
              setEditingGroup(null);
              setGroupForm({ name: "", type: "player", memberIds: [] });
              setGroupMemberSearch("");
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold"
          >
            ➕ Create Group
          </button>
        </div>

        {/* Group Form */}
        {showGroupForm && (
          <div className="bg-white/10 p-6 rounded-lg border border-emerald-400/30 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingGroup ? "Edit Group" : "Create New Group"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-1 block">Group Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                  placeholder="Enter group name"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">Group Type *</label>
                <CustomSelect
                  className="w-full"
                  value={groupForm.type}
                  onChange={(e) => {
                    setGroupForm({ ...groupForm, type: e.target.value, memberIds: [] });
                    setGroupMemberSearch("");
                  }}
                >
                  <option value="player">Player Group</option>
                  <option value="staff">Staff Group</option>
                </CustomSelect>
              </div>
              <div>
                <label className="text-white text-sm mb-1 block">
                  Add Members ({groupForm.memberIds.length} selected)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white mb-2"
                  placeholder="Search by name, ID, or email..."
                  value={groupMemberSearch}
                  onChange={(e) => setGroupMemberSearch(e.target.value)}
                />
                <div className="max-h-48 overflow-y-auto border border-white/20 rounded bg-white/5 p-2 space-y-1">
                  {getAvailableMembers().length > 0 ? (
                    getAvailableMembers().map(member => (
                      <div
                        key={member.id}
                        onClick={() => {
                          if (!groupForm.memberIds.includes(member.id)) {
                            setGroupForm({
                              ...groupForm,
                              memberIds: [...groupForm.memberIds, member.id]
                            });
                          }
                        }}
                        className="p-2 hover:bg-white/10 cursor-pointer rounded text-white text-sm"
                      >
                        {member.name} ({member.id}) - {member.email}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm p-2">No members found</div>
                  )}
                </div>
              </div>
              {groupForm.memberIds.length > 0 && (
                <div>
                  <label className="text-white text-sm mb-1 block">Selected Members</label>
                  <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded border border-white/20">
                    {groupForm.memberIds.map(memberId => {
                      const member = groupForm.type === "player"
                        ? registeredPlayers.find(p => p.id === memberId)
                        : mockStaff.find(s => s.id === memberId);
                      if (!member) return null;
                      return (
                        <div
                          key={memberId}
                          className="bg-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                        >
                          {member.name}
                          <button
                            onClick={() => {
                              setGroupForm({
                                ...groupForm,
                                memberIds: groupForm.memberIds.filter(id => id !== memberId)
                              });
                            }}
                            className="hover:text-red-300"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveGroup}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  {editingGroup ? "Update Group" : "Create Group"}
                </button>
                <button
                  onClick={() => {
                    setShowGroupForm(false);
                    setEditingGroup(null);
                    setGroupForm({ name: "", type: "player", memberIds: [] });
                    setGroupMemberSearch("");
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Groups List */}
        <div className="bg-white/10 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Groups ({customGroups.length})</h3>
          {customGroups.length > 0 ? (
            <div className="space-y-3">
              {customGroups.map(group => {
                const members = getGroupMembersDetails(group);
                return (
                  <div key={group.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-semibold text-lg">{group.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${group.type === "player"
                            ? "bg-blue-500/30 text-blue-300 border border-blue-400/50"
                            : "bg-purple-500/30 text-purple-300 border border-purple-400/50"
                            }`}>
                            {group.type === "player" ? "Player Group" : "Staff Group"}
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm">
                          {members.length} member(s)
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditGroup(group)}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {members.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {members.slice(0, 5).map(member => (
                          <div
                            key={member.id}
                            className="bg-white/5 text-gray-300 px-2 py-1 rounded text-xs"
                          >
                            {member.name}
                          </div>
                        ))}
                        {members.length > 5 && (
                          <div className="bg-white/5 text-gray-400 px-2 py-1 rounded text-xs">
                            +{members.length - 5} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No custom groups created yet. Click "Create Group" to get started.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

