const socket = io("http://localhost:3000"); // backend socket server

document.getElementById('postForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const text = document.getElementById('postText').value;
  const image = document.getElementById('postImage').files[0];

  const post = {
    id: Date.now(),
    text,
    imageURL: image ? URL.createObjectURL(image) : null,
    author: "Celebrity1",
    timestamp: new Date().toLocaleString()
  };

  const posts = JSON.parse(localStorage.getItem("allPosts") || "[]");
  posts.unshift(post);
  localStorage.setItem("allPosts", JSON.stringify(posts));

  renderPost(post);

  // ✅ Socket emit
  socket.emit("new_post", post);
  console.log("🔴 Sent post to socket:", post); // debug log

  // Reset
  document.getElementById('postText').value = '';
  document.getElementById('postImage').value = '';
});

function renderPost(post) {
  const postDiv = document.createElement('div');
  postDiv.className = "bg-white p-4 shadow rounded";
  postDiv.innerHTML = `
    <p class="text-left font-semibold text-purple-700">${post.author}</p>
    <p>${post.text}</p>
    ${post.imageURL ? `<img src="${post.imageURL}" class="mt-2 max-h-60 mx-auto" />` : ""}
    <p class="text-sm text-gray-500">${post.timestamp}</p>
  `;
  document.getElementById('postList').prepend(postDiv);
}const post = {
  ...
  likes: 0 // add this field
};

