// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './UserList.css';
// import { formatDateTime } from '../../utils/dateFormatter';

// interface User {
//   id: string;
//   name: string;
//   username: string;
//   password: string;
//   createdAt: string;
//   updatedAt: string;
//   deletedAt: string | null;
//   slug: string;
//   phone: string;
//   role: string;
//   isRegistered: boolean;
//   roleId: string;
// }

// interface Role {
//   id: number;
//   name: string;
// }

// const UserList: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
//   const [roles, setRoles] = useState<Role[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   const [filterRole, setFilterRole] = useState<string>("");
//   const [filterKeyword, setFilterKeyword] = useState<string>("");

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await axios.get(
//           "http://localhost:4000/api/userManagement"
//         );
//         if (response.data.success) {
//           const formattedUsers: User[] = response.data.data.map(
//             (user: any) => ({
//               id: user.id,
//               name: user.name,
//               username: user.username,
//               password : user.password,
//               createdAt: user.createdAt,
//               phone: user.phone,
//               role: user.role.name.toLowerCase(),
//             })
//           );
//           setUsers(formattedUsers);
//           setFilteredUsers(formattedUsers);
//         } else {
//           setError("Không thể lấy dữ liệu từ API");
//         }
       
//       } catch (err: any) {
//         setError("Đã có lỗi xảy ra khi gọi API: " + err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const fetchRoles = async () => {
//       try {
//         const response = await axios.get(
//           "http://localhost:4000/api/auth/roles"
//         );
//         if (response.data.success) {
//           const formattedRoles: Role[] = response.data.data.map(
//             (role: any) => ({
//               id: role.id,
//               name: role.name.toLowerCase(),
//             })
//           );
//           setRoles(formattedRoles);
//         } else {
//           setError("Không thể lấy danh sách role từ API");
//         }
//       } catch (err: any) {
//         setError("Đã có lỗi xảy ra khi gọi API roles: " + err.message);
//       }
//     };

//     fetchUsers();
//     fetchRoles();
//   }, []);

//   const handleFilter = () => {
//     const keyword = filterKeyword.toLowerCase().trim();
//     const filtered = users.filter((user) => {
//       const matchesRole = filterRole === "" || user.role === filterRole;
//       const matchesKeyword =
//         keyword === "" ||
//         user.name.toLowerCase().includes(keyword) ||
//         user.username.toLowerCase().includes(keyword) ||
//         user.phone.toLowerCase().includes(keyword);
//       return matchesRole && matchesKeyword;
//     });
//     setFilteredUsers(filtered);
//   };

//   const handleRoleChange = async (id: string, newRole: string) => {
//     try {
//       const selectedRole = roles.find((role) => role.name === newRole);
//       if (!selectedRole) {
//         setError("Không tìm thấy role được chọn");
//         return;
//       }

//       const user = users.find((u) => u.id === id);
//       if (!user) {
//         setError("Không tìm thấy người dùng");
//         return;
//       }

//       // Make the PUT request to update the user's role
//       // await axios.put(`http://localhost:4000/api/userManagement/${id}`, {
//       //   username: user.username,
//       //   password: user.password,
//       //   roleId: selectedRole.id,
//       // });
//       console.log("user : ", user);
//       // Update the local state only after successful API call
//       setFilteredUsers((prevUsers) =>
//         prevUsers.map((user) =>
//           user.id === id ? { ...user, role: newRole } : user
//         )
//       );
//       setSuccessMessage(
//         `Cập nhật role thành công cho người dùng ${user.username}`
//       );
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (err: any) {
//       setError("Đã có lỗi xảy ra khi cập nhật role: " + err.message);
//     }
//   };



//   if (loading) return <div>Đang tải dữ liệu...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div className="user-list-container">
//       <h2>Danh Sách Người Dùng</h2>
//       {successMessage && (
//         <div className="success-notification">
//           {successMessage}
//         </div>
//       )}
//       <div className="filter-section">
//         <div className="filter-group">
//           <label htmlFor="filter-role">Role:</label>
//           <select
//             id="filter-role"
//             className="filter-select"
//             value={filterRole}
//             onChange={(e) => setFilterRole(e.target.value)}
//           >
//             <option value="">Tất cả</option>
//             {roles.map((role) => (
//               <option key={role.id} value={role.name}>
//                 {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="filter-group">
//           <label htmlFor="filter-search">Dữ liệu tìm kiếm:</label>
//           <input
//             id="filter-search"
//             type="text"
//             placeholder="Nhập dữ liệu tìm kiếm"
//             className="filter-input"
//             value={filterKeyword}
//             onChange={(e) => setFilterKeyword(e.target.value)}
//           />
//         </div>

//         <button className="search-button" onClick={handleFilter}>
//           Tìm kiếm
//         </button>
//       </div>

//       <table className="user-table">
//         <thead>
//           <tr>
//             <th>STT</th>
//             <th>Tên</th>
//             <th>Tên đăng nhập</th>
//             <th>Số điện thoại</th>
//             <th>Thời gian tạo</th>
//             <th>Role</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredUsers.length > 0 ? (
//             filteredUsers.map((user, index) => (
//               <tr key={user.id}>
//                 <td>{index + 1}</td>
//                 <td>{user.name}</td>
//                 <td>{user.username}</td>
//                 <td>{user.phone}</td>
//                                   <td>{formatDateTime(user.createdAt)}</td>
//                 <td>
//                   <select
//                     value={user.role}
//                     onChange={(e) => handleRoleChange(user.id, e.target.value)}
//                     className="role-select"
//                   >
//                     {roles.map((role) => (
//                       <option key={role.id} value={role.name}>
//                         {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
//                       </option>
//                     ))}
//                   </select>
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={5} style={{ textAlign: "center" }}>
//                 Không có dữ liệu hiển thị
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default UserList;