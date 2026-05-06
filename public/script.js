document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로딩 완료...');

    loadBoardCards();
})

function loadBoardCards() {
    const cardList = document.getElementById('card-list');
    fetch('/api/note/table/feedbackList')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        data.forEach(item => {
            const newCard = document.createElement('div');
            newCard.innerHTML = `
                    <div class="card-title">${item.title}</div>
                    <div class="card-message">${item.message}</div>`;
            newCard.className = 'card-item';
            newCard.dataset.id = item.id;

            cardList.appendChild(newCard);
        });
    });
    cardList.innerHTML = '';
}

const title = document.getElementById('input-title');
const message = document.getElementById('input-text');

function uploadNote() {
    console.log('버튼 클릭...');

    fetch('/api/note/create', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.value, message: message.value })
    })
        .then(response => response.json())
        .then(() => {
            loadBoardCards();
            title.value = '';
            message.value = '';
        });
}

let selectedNoteItem = null;

function loadNewNote() {
    title.value = '';
    title.readOnly = false;
    message.value = '';
    message.readOnly = false;
}

function deleteNote(item) {
    if(!title.readOnly && !message.readOnly) {
        console.log('노트를 선택하세요');
    } else {
        console.log('노트가 선택되었습니다');
        console.log('선택한 노트 삭제 완료');
        const cardItem = item.closest('.card-item'); 
        console.log(`선택한 노트의 id: ${cardItem.dataset.id}`)
        fetch(`/api/note/${cardItem.dataset.id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(() => {
                title.value = '';
                title.readOnly = false;
                message.value = '';
                message.readOnly = false;
            })
            .then(loadBoardCards());
    }
}

function updateNote() {
    
}

document.getElementById('note-actions').addEventListener('click', (ev) => {
    const noteAction = ev.target.closest('button');
    const action = noteAction.className.split(' ')[0];

    if (action == 'note-action--create') {
        console.log('새 노트 로드 성공');
        loadNewNote();
    } else if(action == 'note-action--delete') {
        deleteNote(selectedNoteItem);
    } else if(action == 'note-action--update') {
        console.log('선택한 노트 수정 완료');
        // fetch()
    } else if(action == 'note-action--complete') {
        console.log('선택한 노트 저장 완료');
        uploadNote();
    } else {
        console.log('실패');
    }
});

document.getElementById('left-side').addEventListener('click', (ev) => {
    console.log(ev);

    if (ev.target.className != 'card-title' && ev.target.className != 'card-message') {
        console.log('리스트를 선택하세요. ');
        return;
    }

    const cardItem = ev.target.closest('.card-item');
    selectedNoteItem = cardItem;
    const id = cardItem.dataset.id;
    console.log(id);

    fetch(`/api/note/${id}`)
        .then(response => response.json())
        .then(data => {
            
            cardTitle.value = data.title;
            cardTitle.readOnly = true;
            cardMessage.value = data.message;
            cardMessage.readOnly = true;
        });
})