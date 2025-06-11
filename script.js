// DOM Elements
const mainPage = document.getElementById('main-page');
const createPage = document.getElementById('create-page');
const playPage = document.getElementById('play-page');
const editPage = document.getElementById('edit-page');
const createBtn = document.getElementById('create-btn');
const playBtn = document.getElementById('play-btn');
const editBtn = document.getElementById('edit-btn');
const backFromCreate = document.getElementById('back-from-create');
const backFromPlay = document.getElementById('back-from-play');
const backFromEdit = document.getElementById('back-from-edit');
// Create Page Elements
const topicNameInput = document.getElementById('topic-name');
const cardsContainer = document.getElementById('cards-container');
const addCardBtn = document.getElementById('add-card-btn');
const saveTopicBtn = document.getElementById('save-topic-btn');
const clearCreateBtn = document.getElementById('clear-create-btn');
// Play Page Elements
const topicSelect = document.getElementById('topic-select');
const playArea = document.getElementById('play-area');
const noTopicsMessage = document.getElementById('no-topics-message');
// Edit Page Elements
const editTopicsContainer = document.getElementById('edit-topics-container');

// Global variables
let topics = JSON.parse(localStorage.getItem('flashcardTopics')) || [];
let currentTopic = null;
let currentCardIndex = 0;
let currentFaceIndex = 0;
let currentTopicIndex = -1;

// Navigation
createBtn.addEventListener('click', () => showPage('create-page'));
playBtn.addEventListener('click', () => showPage('play-page'));
editBtn.addEventListener('click', () => showPage('edit-page'));
backFromCreate.addEventListener('click', () => showPage('main-page'));
backFromPlay.addEventListener('click', () => showPage('main-page'));
backFromEdit.addEventListener('click', () => showPage('main-page'));
function showPage(page){
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    if(page === 'play-page') loadTopicsForPlay();
    else if(page === 'edit-page') loadTopicsForEdit();
    else if (page === 'create-page') currentTopicIndex = -1;
}

// ---------- "Create" Page ------------

function addNewCard(){ // adding new cards
    const cardId = Date.now(); // unique ID :D
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.dataset.id = cardId;
    cardDiv.innerHTML = `
        <div class="card-header">
            <span class="card-title">Card #${cardsContainer.children.length + 1}</span>
            <button class="remove-card"><i class="fas fa-times"></i></button>
        </div>
        <div class="faces-container" data-card-id="${cardId}">
            <!-- Faces will be added here -->
        </div>
        <button class="btn btn-outline add-face-btn" style="width: 100%; margin-top: 10px;">
            <i class="fas fa-plus"></i> Add Face
        </button>
    `;
    cardsContainer.appendChild(cardDiv); addNewFaceToCard(cardId); // add first face by default
    cardDiv.querySelector('.remove-card').addEventListener('click', () => {cardDiv.remove();});
    cardDiv.querySelector('.add-face-btn').addEventListener('click', () => {addNewFaceToCard(cardId);});
}

function addNewFaceToCard(cardId){ // dealing with faces
    const facesContainer = document.querySelector(`.faces-container[data-card-id="${cardId}"]`);
    const faceCount = facesContainer.children.length;
    const faceDiv = document.createElement('div');
    faceDiv.className = 'face-container';
    faceDiv.innerHTML = `
        <div class="face-header">
            <span class="face-title">Face #${faceCount + 1}</span>
            ${faceCount > 0 ? '<button class="remove-face"><i class="fas fa-times"></i></button>' : ''}
        </div>
        <textarea placeholder="Enter content for this face..."></textarea>
    `;
    facesContainer.appendChild(faceDiv);
    const removeBtn = faceDiv.querySelector('.remove-face'); // remove face
    if(removeBtn) removeBtn.addEventListener('click', () => {faceDiv.remove();});
}

function clearCreateForm(){
    topicNameInput.value = '';
    cardsContainer.innerHTML = '';
}

function saveTopic(){
    const topicName = topicNameInput.value.trim();
    const cards = []; // save cards here
    const cardElements = cardsContainer.querySelectorAll('.card');

    if(!topicName){ // edgecases
        alert('Please enter a topic name'); return;
    } if(cardElements.length === 0){
        alert('Please add at least one card'); return;
    } 
    
    cardElements.forEach(cardElement => {
        const faces = [];
        const textareas = cardElement.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            const content = textarea.value.trim();
            if(content) faces.push(content);
        });
        if (faces.length > 0) cards.push({id: cardElement.dataset.id, faces});
    });

    if(cards.length === 0){ // edgecase
        alert('Please add content to at least one card'); return;
    }
    
    // Check if topic already exists
    const existingIndex = topics.findIndex(t => t.name === topicName);
    if(existingIndex >= 0) topics[existingIndex].cards = cards; // update to cur
    else topics.push({name: topicName, cards}); // add new
    
    localStorage.setItem('flashcardTopics', JSON.stringify(topics)); // save to local
    
    alert(`Topic "${topicName}" saved successfully!`);
    clearCreateForm();
    showPage('main-page');
}

// buttons
addCardBtn.addEventListener('click', addNewCard);
saveTopicBtn.addEventListener('click', saveTopic);
clearCreateBtn.addEventListener('click', clearCreateForm);

// ------------- "Create" page end -----------------

// ---------------- "Play" Page -------------------

document.addEventListener('DOMContentLoaded', () => {
    if(topics.length > 0) noTopicsMessage.style.display = 'none';
});

topicSelect.addEventListener('change', (e) => {
    if(e.target.value) loadTopic(e.target.value);
    else{
        playArea.innerHTML = ''; playArea.appendChild(noTopicsMessage);
    }
});

function loadTopicsForPlay(){
    topicSelect.innerHTML = '<option value="">-- Select a topic --</option>';
    
    if(topics.length === 0){ // edgecase
        noTopicsMessage.style.display = 'block';
        playArea.innerHTML = '';
        playArea.appendChild(noTopicsMessage);
        return;
    } 
    
    noTopicsMessage.style.display = 'none';
    
    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic.name;
        option.textContent = topic.name;
        topicSelect.appendChild(option);
    });
}

function loadTopic(topicName) {
    currentTopic = topics.find(t => t.name === topicName);
    if(!currentTopic) return;
    
    currentCardIndex = 0; currentFaceIndex = 0; // initialize cards
    renderCurrentCard();
}

function renderCurrentCard() {
    if(!currentTopic || currentTopic.cards.length === 0){ // edgecase
        playArea.innerHTML = '<p>No cards in this topic</p>'; return;
    }
    
    const card = currentTopic.cards[currentCardIndex]; // display card
    playArea.innerHTML = `
        <div class="flashcard-display">
            <div class="flashcard" id="current-flashcard">
                <div class="flashcard-content">
                    ${card.faces[currentFaceIndex]}
                </div>
            </div>
        </div>
        <div class="navigation">
            <button class="btn btn-outline" id="prev-card">
                <i class="fas fa-arrow-left"></i> Previous
            </button>
            <span>Card ${currentCardIndex + 1} of ${currentTopic.cards.length}</span>
            <button class="btn btn-outline" id="next-card">
                Next <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    // Click!
    document.getElementById('current-flashcard').addEventListener('click', () => {
        currentFaceIndex = (currentFaceIndex + 1) % currentTopic.cards[currentCardIndex].faces.length;
        renderCurrentCard();
    });
    document.getElementById('prev-card').addEventListener('click', () => {
        if(currentCardIndex > 0){ // bound
            currentCardIndex--; currentFaceIndex = 0; renderCurrentCard();
        }
    });
    document.getElementById('next-card').addEventListener('click', () => {
        if(currentCardIndex < currentTopic.cards.length-1){ // bound
            currentCardIndex++; currentFaceIndex = 0; renderCurrentCard();
        }
    });
}

// -------------- "Play" page end ------------------

// -------------- "Edit" page ----------------

function loadTopicsForEdit() {
    editTopicsContainer.innerHTML = '';
    if(topics.length === 0){ // edgecase
        editTopicsContainer.innerHTML = `
            <div class="no-topics">
                <i class="fas fa-inbox"></i>
                <h3>No Flashcards Available</h3>
                <p>Create some flashcards first to edit them</p>
            </div>
        `;
        return;
    }
    
    topics.forEach((topic, index) => { // make content appear
        const topicDiv = document.createElement('div');
        topicDiv.className = 'edit-topic';
        topicDiv.innerHTML = `
            <div class="edit-topic-header">
                <h3>${topic.name}</h3>
                <div class="edit-topic-actions">
                    <button class="btn btn-outline edit-topic-btn" data-index="${index}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-outline delete-topic-btn" data-index="${index}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            <div class="edit-topic-cards-count">
                ${topic.cards.length} card(s)
            </div>
        `;
        editTopicsContainer.appendChild(topicDiv);
        
        // add buttons
        topicDiv.querySelector('.edit-topic-btn').addEventListener('click', (e) => {
            editTopic(parseInt(e.target.dataset.index));
        });        
        topicDiv.querySelector('.delete-topic-btn').addEventListener('click', (e) => {
            deleteTopic(parseInt(e.target.dataset.index));
        });
    });
}

function editTopic(topicIndex) {
    currentTopicIndex = topicIndex;
    const topic = topics[topicIndex];
    
    // Populate the create form with existing data
    topicNameInput.value = topic.name;
    cardsContainer.innerHTML = '';
    
    topic.cards.forEach((card, cardIndex) => { // add a box for each card
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.id = card.id || Date.now();
        cardDiv.innerHTML = `
            <div class="card-header">
                <span class="card-title">Card #${cardIndex + 1}</span>
                <button class="remove-card"><i class="fas fa-times"></i></button>
            </div>
            <div class="faces-container" data-card-id="${cardDiv.dataset.id}">
                <!-- Faces will be added here -->
            </div>
            <button class="btn btn-outline add-face-btn" style="width: 100%; margin-top: 10px;">
                <i class="fas fa-plus"></i> Add Face
            </button>
        `;
        
        cardsContainer.appendChild(cardDiv);
        
        // edit faces
        const facesContainer = cardDiv.querySelector('.faces-container');
        card.faces.forEach((face, faceIndex) => {
            const faceDiv = document.createElement('div');
            faceDiv.className = 'face-container';
            faceDiv.innerHTML = `
                <div class="face-header">
                    <span class="face-title">Face #${faceIndex + 1}</span>
                    ${faceIndex > 0 ? '<button class="remove-face"><i class="fas fa-times"></i></button>' : ''}
                </div>
                <textarea placeholder="Enter content for this face...">${face}</textarea>
            `;
            facesContainer.appendChild(faceDiv);

            const removeBtn = faceDiv.querySelector('.remove-face');
            if(removeBtn) removeBtn.addEventListener('click', () => {faceDiv.remove();}); // remove
        });
        // more buttons!
        cardDiv.querySelector('.remove-card').addEventListener('click', () => {cardDiv.remove();});
        cardDiv.querySelector('.add-face-btn').addEventListener('click', () => {addNewFaceToCard(cardDiv.dataset.id);});
    });
    
    showPage('create-page');
}

function deleteTopic(topicIndex){ // delete topic
    if(confirm(`Are you sure you want to delete "${topics[topicIndex].name}" and all its cards?`)){
        topics.splice(topicIndex, 1); localStorage.setItem('flashcardTopics', JSON.stringify(topics));
        loadTopicsForEdit();
    }
}