const celebrities = ["Celebrity1", "Celebrity2", "Celebrity3"];
let followedCelebs = JSON.parse(localStorage.getItem("followedCelebs") || "[]");
let allPosts = JSON.parse(localStorage.getItem("allPosts") || "[]");
let currentIndex = 0;
const batchSize = 5;

// Render Follow/Unfollow Buttons
function renderCelebrities() {
  const listDiv = document.getElementById("celebrityList");
  listDiv.innerHTML = "";

  celebrities.forEach(celeb => {
    const isFollowing = followedCelebs.includes(celeb);
    const button = document.createElement("button");
    button.textContent = isFollowing ? "Unfollow" : "Follow";
    button.className = isFollowing 
      ? "bg-red-500 text-white px-4 py-1 rounded ml-4"
      : "bg-green-600 text-white px-4 py-1 rounded ml-4";

    button.onclick = () => {
      if (isFollowing) {
        followedCelebs = followedCelebs.filter(c => c !== celeb);
      } else {
        followedCelebs.push(celeb);
      }
      localStorage.setItem("followedCelebs", JSON.stringify(followedCelebs));
      renderCelebrities();
      resetFeed();
    };

    const row = document.createElement("div");
    row.className = "flex justify-between items-center bg-white p-2 rounded shadow";
    row.innerHTML = `<span class="font-medium">${celeb}</span>`;
    row.appendChild(button);

    listDiv.appendChild(row);
  });
}

// Render single post with like button
function renderPost(post, prepend = false) {
  const postDiv = document.createElement('div');
  postDiv.className = "bg-white p-4 shadow rounded";
  postDiv.innerHTML = `
    <p class="text-left font-semibold text-blue-700">${post.author}</p>
    <p>${post.text}</p>
    ${post.imageURL ? `<img src="${post.imageURL}" class="mt-2 max-h-60 mx-auto" />` : ""}
    <p class="text-sm text-gray-500">${post.timestamp}</p>
    <div class="flex items-center justify-between mt-3">
      <button class="like-btn bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600" data-id="${post.id}">
        ❤️ Like
      </button>
      <span class="text-sm text-gray-600">Likes: <span class="like-count" data-id="${post.id}">${post.likes || 0}</span></span>
    </div>
  `;

  const feed = document.getElementById("postFeed");
  prepend ? feed.prepend(postDiv) : feed.appendChild(postDiv);

  // Like button logic
  postDiv.querySelector('.like-btn').addEventListener('click', () => {
    const allPosts = JSON.parse(localStorage.getItem("allPosts") || "[]");
    const updatedPosts = allPosts.map(p => {
      if (p.id == post.id) {
        p.likes = (p.likes || 0) + 1;
      }
      return p;
    });

    localStorage.setItem("allPosts", JSON.stringify(updatedPosts));

    // Update like count
    const likeCount = postDiv.querySelector(`.like-count[data-id="${post.id}"]`);
    if (likeCount) likeCount.textContent = parseInt(likeCount.textContent) + 1;
  });
}

// Load Posts in Batches
function loadMorePosts() {
  const loading = document.getElementById("loading");
  loading.classList.remove("hidden");

  setTimeout(() => {
    const postFeed = document.getElementById("postFeed");
    const filteredPosts = allPosts.filter(post => followedCelebs.includes(post.author));
    const nextPosts = filteredPosts.slice(currentIndex, currentIndex + batchSize);

    if (nextPosts.length === 0) {
      const endMsg = document.getElementById("endMessage");
      if (endMsg) endMsg.classList.remove("hidden");
      loading.classList.add("hidden");
      return;
    }

    nextPosts.forEach(post => renderPost(post));
    currentIndex += batchSize;
    loading.classList.add("hidden");
  }, 500);
}

// Reset Feed
function resetFeed() {
  currentIndex = 0;
  document.getElementById("postFeed").innerHTML = "";
  allPosts = JSON.parse(localStorage.getItem("allPosts") || "[]");
  loadMorePosts();
}

// Infinite Scroll
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
    loadMorePosts();
  }
});

// Toast Notification
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

// Real-Time Socket
const socket = io("http://localhost:3000");

socket.on("receive_post", (post) => {
  if (followedCelebs.includes(post.author)) {
    showToast(`📢 New post from ${post.author}!`);

    // Make sure likes is initialized
    post.likes = post.likes || 0;
    renderPost(post, true);
  }
});

// Init
renderCelebrities();
loadMorePosts();
