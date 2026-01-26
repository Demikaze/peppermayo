const STORAGE_KEY = 'peppermayo_links_v1';
const OPEN_URL = 'https://peppermayo.i143.xyz';

const form = document.getElementById('addForm');
const titleInput = document.getElementById('title');
const urlInput = document.getElementById('url');
const linksList = document.getElementById('linksList');

let links = [];

function loadLinks(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    links = raw ? JSON.parse(raw) : [];
  }catch(e){
    links = [];
  }
}

function saveLinks(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

function validateUrl(value){
  try{
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  }catch(e){
    return false;
  }
}

function normalizeUrl(value){
  let v = value.trim();
  if (!/^[a-zA-Z]+:\/\//.test(v)){
    v = 'https://' + v;
  }
  return v;
}

function renderLinks(){
  linksList.innerHTML = '';
  if (links.length === 0){
    const li=document.createElement('li');
    li.className='link-item';
    li.textContent = 'No links yet — add one above.';
    linksList.appendChild(li);
    return;
  }

  links.forEach(link =>{
    const li = document.createElement('li');
    li.className = 'link-item';

    const left = document.createElement('div');
    left.className = 'link-left';

    const a = document.createElement('a');
    a.href = link.url;
    a.textContent = link.title || link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = link.url;

    left.appendChild(a);
    left.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'link-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-btn delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => {
      if (confirm('Delete this link?')) {
        links = links.filter(l => l.id !== link.id);
        saveLinks();
        renderLinks();
      }
    };

    actions.appendChild(deleteBtn);
    li.appendChild(left);
    li.appendChild(actions);

    linksList.appendChild(li);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let url = urlInput.value.trim();
  if (!url) return;

  url = normalizeUrl(url);
  if (!validateUrl(url)) {
    alert('Please enter a valid URL (http:// or https://).');
    return;
  }

  const title = titleInput.value.trim() || url;
  const newLink = { id: Date.now(), title, url };
  links.unshift(newLink); // show newest first
  saveLinks();
  renderLinks();

  // Open the fixed URL immediately in a new tab
  try {
    const a = document.createElement('a');
    a.href = OPEN_URL;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    window.open(OPEN_URL, '_blank');
  }

  titleInput.value = '';
  urlInput.value = '';
  urlInput.focus();
});

// initialize with an example link (only if empty)
loadLinks();
if (links.length === 0){
  links = [
    { id: Date.now(), title: 'Example', url: 'https://example.com' }
  ];
  saveLinks();
}
renderLinks();