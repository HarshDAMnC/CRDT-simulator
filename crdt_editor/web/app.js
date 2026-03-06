/**
 * Document Editor App Logic
 */

class EditorClient {
    constructor(siteId, bus) {
        this.siteId = siteId;
        this.tree = new window.LSEQTree();
        this.bus = bus;
        this.cursorIndex = 0; // Local integer cursor
        
        // Listen to events from "other" users
        this.bus.subscribe((op) => {
            if (op.originSite !== this.siteId) {
                if (op.type === window.OpType.INSERT) {
                    this.tree.insert(op.pos, op.val);
                    // Adjust local integer cursor if someone typed *before* us
                    const positions = this.tree.getDocumentState().positions;
                    const insertedIdx = this._findIndex(positions, op.pos);
                    if (insertedIdx <= this.cursorIndex) {
                        this.cursorIndex++;
                    }
                } else {
                    this.tree.remove(op.pos);
                    // Same for deletions
                    const positions = this.tree.getDocumentState().positions;
                    if (this.cursorIndex > positions.length) {
                        this.cursorIndex = positions.length;
                    }
                }
                // Tell the UI that we received a remote change
                if (window.onRemoteUpdate) window.onRemoteUpdate(this.siteId);
            }
        });
    }

    _findIndex(positions, posToFind) {
        // Deep compare pos array
        for (let i=0; i<positions.length; i++) {
            let p1 = positions[i];
            if (p1.length === posToFind.length) {
                let match = true;
                for(let j=0; j<p1.length; j++) {
                    if (p1[j].digit !== posToFind[j].digit || p1[j].site !== posToFind[j].site) {
                        match = false; break;
                    }
                }
                if (match) return i;
            }
        }
        return positions.length; // Assume end if not found
    }

    typeChar(c) {
        const state = this.tree.getDocumentState();
        const positions = state.positions;
        
        let prev = (this.cursorIndex > 0) ? positions[this.cursorIndex - 1] : null;
        let next = (this.cursorIndex < positions.length) ? positions[this.cursorIndex] : null;
        
        // CRDT Math!
        let newPos = this.tree.allocatePos(prev, next, this.siteId);
        
        this.tree.insert(newPos, c);
        this.cursorIndex++; // Local view moves forward
        
        this.bus.broadcast({
            type: window.OpType.INSERT,
            pos: newPos,
            val: c,
            originSite: this.siteId
        });
    }

    deleteChar() {
        if (this.cursorIndex <= 0) return;
        
        const state = this.tree.getDocumentState();
        const positions = state.positions;
        
        let targetPos = positions[this.cursorIndex - 1];
        this.tree.remove(targetPos);
        this.cursorIndex--; // Move cursor back
        
        this.bus.broadcast({
            type: window.OpType.DELETE,
            pos: targetPos,
            originSite: this.siteId
        });
    }

    moveCursorLeft() {
        if (this.cursorIndex > 0) this.cursorIndex--;
    }

    moveCursorRight() {
        const len = this.tree.getDocumentState().positions.length;
        if (this.cursorIndex < len) this.cursorIndex++;
    }

    // Force cursor to end (useful when switching users)
    jumpToEnd() {
        this.cursorIndex = this.tree.getDocumentState().positions.length;
    }
}

// -----------------------------------------
// UI Controller
// -----------------------------------------

// Generate a random User ID for this browser tab to simulate network reality
// LSEQ requires globally unique siteIDs to break ties!
const localUserId = Math.floor(Math.random() * 1000) + 1;
const remoteUserId = Math.floor(Math.random() * 1000) + 1001;

const network = new window.MessageBus();
const client1 = new EditorClient(localUserId, network);
const client2 = new EditorClient(remoteUserId, network);

let activeUser = 1; // 1 or 2

// Initial Text 
client1.typeChar('H');
client1.typeChar('i');
// Fast forward cursors
client1.jumpToEnd();
client2.jumpToEnd();


// --- DOM Elements ---
const hiddenInput = document.getElementById('hiddenInput');
const paperEl = document.getElementById('paper');
const contentLayer = document.getElementById('contentLayer');
const cursor1El = document.getElementById('cursor1');
const cursor2El = document.getElementById('cursor2');
const activeUserBadge = document.getElementById('activeUserBadge');
const activeUserName = document.getElementById('activeUserName');
const bodyEl = document.body;

// Timer to hide remote cursor flag
let cursor2FlagTimeout = null;

// Keep focus locked so you can always type
document.addEventListener('click', () => {
    hiddenInput.focus();
});
hiddenInput.focus();

// Trigger UI refresh when networked packets arrive
window.onRemoteUpdate = (receiverId) => {
    renderUI();
    // Simulate Google-docs behavior: Remote user's flag pops up briefly when they edit
    if (activeUser === 1 && receiverId === 1) {
        cursor2El.classList.add('show-flag');
        clearTimeout(cursor2FlagTimeout);
        cursor2FlagTimeout = setTimeout(() => cursor2El.classList.remove('show-flag'), 1500);
    }
};

function renderUI() {
    const activeClient = (activeUser === 1) ? client1 : client2;
    const idleClient = (activeUser === 1) ? client2 : client1;
    
    // We render the Active user's view of the text 
    const state = activeClient.tree.getDocumentState();
    const text = state.text;
    
    // Convert to spans so we can measure exact pixel positions for the absolute Cursors
    contentLayer.innerHTML = '';
    
    // If empty text, add a dummy zero-width space so spans exist to measure height
    if (text.length === 0) {
        contentLayer.innerHTML = '<span class="char-span" id="char-blank">&#8203;</span>';
    } else {
        for (let i = 0; i < text.length; i++) {
            let ch = text[i];
            if (ch === ' ') ch = '&nbsp;'; // HTML spacing
            if (ch === '\n') ch = '<br>';  // HTML newlines
            contentLayer.innerHTML += `<span class="char-span" id="char-${i}">${ch}</span>`;
        }
    }

    // Position cursors via DOM math
    positionCursor(cursor1El, client1.cursorIndex, activeUser === 1);
    positionCursor(cursor2El, client2.cursorIndex, activeUser === 2);

    // Update Header styling
    if (activeUser === 1) {
        bodyEl.classList.remove('user2-active');
        bodyEl.classList.add('user1-active');
        activeUserName.innerText = `User 1 (ID: ${localUserId})`;
        cursor1El.classList.add('active');
        cursor1El.classList.remove('idle');
        cursor2El.classList.add('idle');
        cursor2El.classList.remove('active');
        hiddenInput.value = ""; // clear 
    } else {
        bodyEl.classList.remove('user1-active');
        bodyEl.classList.add('user2-active');
        activeUserName.innerText = `User 2 (ID: ${remoteUserId})`;
        cursor2El.classList.add('active');
        cursor2El.classList.remove('idle');
        cursor1El.classList.add('idle');
        cursor1El.classList.remove('active');
        hiddenInput.value = "";
    }
}

function positionCursor(cursorEl, index, isLocalAndActive) {
    cursorEl.style.display = 'block';
    
    // Find the span closest to the index
    if (index === 0) {
        const firstSpan = document.getElementById('char-0') || document.getElementById('char-blank');
        if (firstSpan) {
            cursorEl.style.left = `${firstSpan.offsetLeft}px`;
            cursorEl.style.top = `${firstSpan.offsetTop}px`;
        }
    } else {
        const prevSpan = document.getElementById(`char-${index - 1}`);
        if (prevSpan) {
            cursorEl.style.left = `${prevSpan.offsetLeft + prevSpan.offsetWidth}px`;
            cursorEl.style.top = `${prevSpan.offsetTop}px`;
        }
    }
}

// -----------------------------------------
// Keyboard Events
// -----------------------------------------

hiddenInput.addEventListener('keydown', (e) => {
    const activeClient = (activeUser === 1) ? client1 : client2;

    if (e.key === 'Tab') {
        e.preventDefault();
        activeUser = (activeUser === 1) ? 2 : 1;
        
        // Fast forward user 2's cursor to latest end visually when you swap to them
        if (activeUser === 2) client2.jumpToEnd();
        else client1.jumpToEnd();
        
        renderUI();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        activeClient.moveCursorLeft();
        renderUI();
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        activeClient.moveCursorRight();
        renderUI();
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        activeClient.deleteChar();
        renderUI();
    }
});

hiddenInput.addEventListener('input', (e) => {
    // Input event captures standard printable keys including spacing
    const val = e.data;
    if (val && val.length > 0) {
        const activeClient = (activeUser === 1) ? client1 : client2;
        // We only care about the last character typed in the hidden input buffer
        activeClient.typeChar(val[val.length - 1]);
        hiddenInput.value = ''; // Flush buffer
        renderUI();
    }
});

// Initial Startup
renderUI();
