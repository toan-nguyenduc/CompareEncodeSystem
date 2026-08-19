const API_BASE = '/api/videos';
let stompClient = null;

// DOM Elements
const videoTableBody = document.getElementById('videoTableBody');
const addVideoForm = document.getElementById('addVideoForm');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
    connectWebSocket();
});

async function fetchAPI(url, options = {}) {
    const response = await fetch(url, options);
    if (response.redirected && response.url.includes('login')) {
        window.location.href = '/login.html';
        return null;
    }
    return response;
}

// Initial Load
async function loadVideos() {
    try {
        const response = await fetchAPI(API_BASE);
        if (!response) return;
        const videos = await response.json();
        renderTable(videos);
    } catch (error) {
        console.error("Error fetching videos:", error);
    }
}

// Add new video
addVideoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const csmId = document.getElementById('csmId').value;
    const peId = document.getElementById('peId').value;
    const addBtn = document.getElementById('addBtn');
    
    addBtn.disabled = true;
    addBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
    try {
        const response = await fetchAPI(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csmId: parseInt(csmId), peId: parseInt(peId), convertPriority: 10000 })
        });
        
        if (!response) return;

        if (response.ok) {
            const newVideo = await response.json();
            appendRow(newVideo);
            addVideoForm.reset();
        } else {
            const errData = await response.json();
            alert(errData.message || 'Lỗi khi thêm video!');
        }
    } catch (error) {
        console.error("Error adding video:", error);
        alert('Lỗi kết nối máy chủ!');
    } finally {
        addBtn.disabled = false;
        addBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Theo Dõi Ngay';
    }
});

// Trigger encode
async function triggerEncode(id) {
    const btn = document.querySelector(`button[data-id="${id}"]`);
    const priorityInput = document.getElementById(`priority-${id}`);
    let priority = 10000;
    if (priorityInput && priorityInput.value) {
        priority = parseInt(priorityInput.value);
    }
    
    if(btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Triggering...';
    }
    
    try {
        const response = await fetchAPI(`${API_BASE}/${id}/encode?priority=${priority}`, {
            method: 'POST'
        });
        if (!response) return;
        
        if (response.ok) {
            const updatedVideo = await response.json();
            updateRow(updatedVideo);
        } else {
            alert('Lỗi khi trigger encode!');
            if(btn) btn.disabled = false;
        }
    } catch (error) {
        console.error("Error triggering encode:", error);
        if(btn) btn.disabled = false;
    }
}

// Connect to WebSocket
function connectWebSocket() {
    const socket = new SockJS('/ws-eval');
    stompClient = Stomp.over(socket);
    stompClient.debug = null; // Disable debug logging
    
    stompClient.connect({}, (frame) => {
        // Update connection status
        document.querySelector('.status-indicator').innerHTML = '<span class="pulse-dot"></span> Socket Connected';
        document.querySelector('.status-indicator').style.color = 'var(--success)';
        
        stompClient.subscribe('/topic/evaluations', (message) => {
            const updatedVideo = JSON.parse(message.body);
            updateRow(updatedVideo);
        });
    }, (error) => {
        // Update connection status
        document.querySelector('.status-indicator').innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Disconnected';
        document.querySelector('.status-indicator').style.color = 'var(--danger)';
        document.querySelector('.status-indicator').style.background = '#fee2e2';
        
        // Attempt reconnect after 5s
        setTimeout(connectWebSocket, 5000);
    });
}

// Rendering Logic
function renderTable(videos) {
    videoTableBody.innerHTML = '';
    if(videos.length === 0) {
        videoTableBody.innerHTML = `<tr><td colspan="10" class="empty-state">
            <i class="fa-solid fa-folder-open"></i><br>
            Chưa có video nào trong danh sách theo dõi.
        </td></tr>`;
        return;
    }
    videos.forEach(appendRow);
}

function appendRow(video) {
    // If empty state exists, remove it
    const emptyState = document.querySelector('.empty-state');
    if(emptyState) emptyState.parentElement.remove(); // Only remove the <tr>, not the <tbody>

    // Main row
    const tr = document.createElement('tr');
    tr.id = `video-row-${video.id}`;
    tr.className = 'main-row';
    tr.onclick = (e) => {
        // Don't toggle history if clicking on the priority input
        if (e.target.tagName.toLowerCase() === 'input') return;
        toggleHistory(video.id);
    };
    tr.innerHTML = generateRowHTML(video);
    videoTableBody.appendChild(tr);
    
    // History row (hidden by default)
    const histTr = document.createElement('tr');
    histTr.id = `history-row-${video.id}`;
    histTr.className = 'history-row';
    histTr.style.display = 'none';
    histTr.innerHTML = `<td colspan="10"><div id="history-container-${video.id}" class="history-container"></div></td>`;
    videoTableBody.appendChild(histTr);
}

function updateRow(video) {
    const tr = document.getElementById(`video-row-${video.id}`);
    if (tr) {
        // Maintain expanded state
        const isExpanded = tr.classList.contains('expanded');
        
        tr.innerHTML = generateRowHTML(video);
        if(isExpanded) tr.classList.add('expanded');

        tr.style.backgroundColor = '#e0f2fe';
        setTimeout(() => { tr.style.backgroundColor = ''; }, 1000);
        
        // Refresh history if it's currently open
        const histTr = document.getElementById(`history-row-${video.id}`);
        if (histTr && histTr.style.display !== 'none') {
            loadHistoryData(video.id);
        }
    } else {
        appendRow(video);
    }
}

function generateRowHTML(video) {
    const scoreHtml = getScoreHtml(video.score, video.trackingStatus, video.evaluationResult);
    const actionHtml = getActionHtml(video.id, video.trackingStatus);
    const dateStr = new Date(video.updatedAt).toLocaleString('vi-VN');
    const priorityVal = video.convertPriority || 10000;
    const videoName = video.videoName ? `<span style="color:#0f172a;font-weight:500;">${video.videoName}</span>` : `<em style="color:#94a3b8">Không tìm thấy</em>`;
    const displayStatus = getDisplayStatus(video.trackingStatus, video.evaluationResult);
    
    return `
        <td class="text-center"><i class="fa-solid fa-chevron-right chevron-icon"></i></td>
        <td><strong>#${video.id}</strong></td>
        <td>${video.csmId}</td>
        <td>${videoName}</td>
        <td>${video.peId}</td>
        <td><input type="number" class="priority-inline-input" id="priority-${video.id}" value="${priorityVal}" style="width:80px; padding:0.25rem; border:1px solid #cbd5e1; border-radius:4px;" onclick="event.stopPropagation()"></td>
        <td><span class="status-badge ${displayStatus.class}"><i class="${displayStatus.icon}"></i> ${displayStatus.text}</span></td>
        <td>${scoreHtml}</td>
        <td><span style="color:var(--text-muted)"><i class="fa-regular fa-clock"></i> ${dateStr}</span></td>
        <td class="text-right">${actionHtml}</td>
    `;
}

function getDisplayStatus(status, evalResult) {
    if (status === 'error') return { text: 'ERROR', class: 'status-error', icon: 'fa-solid fa-circle-xmark' };
    if (status === 'completed') {
        if (evalResult === 'PASS') return { text: 'PASS', class: 'status-completed', icon: 'fa-solid fa-circle-check' };
        if (evalResult === 'FAIL') return { text: 'FAILED', class: 'status-failed-score', icon: 'fa-solid fa-triangle-exclamation' };
    }
    const icons = {
        'pending': 'fa-solid fa-hourglass-start',
        'encoding': 'fa-solid fa-gear fa-spin',
        'evaluating': 'fa-solid fa-microchip fa-spin'
    };
    return { text: status.toUpperCase(), class: `status-${status}`, icon: icons[status] };
}

function getScoreHtml(score, status, evalResult) {
    if (score === null || score === undefined) return '<span class="score-none">-</span>';
    if (evalResult === 'PASS') return `<span class="score-badge score-pass">${score}</span>`;
    if (evalResult === 'FAIL') return `<span class="score-badge score-fail">${score}</span>`;
    return `<span class="score-badge">${score}</span>`;
}

function getActionHtml(id, status) {
    if (status === 'pending') {
        return `<button class="btn btn-primary btn-sm" data-id="${id}" onclick="event.stopPropagation(); triggerEncode(${id})"><i class="fa-solid fa-play"></i> Trigger</button>`;
    } else if (status === 'encoding') {
        return `<button class="btn btn-warning btn-sm" disabled onclick="event.stopPropagation()"><i class="fa-solid fa-gear fa-spin"></i> Encoding...</button>`;
    } else if (status === 'evaluating') {
        return `<button class="btn btn-info btn-sm" disabled onclick="event.stopPropagation()"><i class="fa-solid fa-microchip fa-spin"></i> Evaluating...</button>`;
    } else if (status === 'completed') {
        return `<button class="btn btn-success btn-sm" data-id="${id}" onclick="event.stopPropagation(); triggerEncode(${id})"><i class="fa-solid fa-rotate-right"></i> Re-trigger</button>`;
    } else if (status === 'error') {
        return `<button class="btn btn-danger btn-sm" data-id="${id}" onclick="event.stopPropagation(); triggerEncode(${id})"><i class="fa-solid fa-rotate-right"></i> Re-trigger</button>`;
    }
    return `<button class="btn btn-secondary btn-sm" disabled onclick="event.stopPropagation()">${status}</button>`;
}

async function toggleHistory(id) {
    const tr = document.getElementById(`video-row-${id}`);
    const histTr = document.getElementById(`history-row-${id}`);
    const container = document.getElementById(`history-container-${id}`);
    
    if (histTr.style.display === 'none') {
        // Expand
        tr.classList.add('expanded');
        histTr.style.display = 'table-row';
        // Small delay to allow display:block to apply before animating max-height
        setTimeout(() => container.classList.add('active'), 10);
        await loadHistoryData(id);
    } else {
        // Collapse
        tr.classList.remove('expanded');
        container.classList.remove('active');
        // Wait for animation to finish before hiding row
        setTimeout(() => { histTr.style.display = 'none'; }, 300);
    }
}

async function loadHistoryData(id) {
    const container = document.getElementById(`history-container-${id}`);
    try {
        container.innerHTML = '<div class="empty-state" style="padding:1rem;"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải lịch sử...</div>';
        const response = await fetchAPI(`${API_BASE}/${id}/history`);
        if (!response) return;
        const historyList = await response.json();
        
        if (historyList.length === 0) {
            container.innerHTML = `<div class="empty-state" style="padding:1rem;">
                <i class="fa-solid fa-clock-rotate-left"></i><br>
                Chưa có lịch sử. Các lần chạy hoàn tất sẽ hiện ở đây.
            </div>`;
            return;
        }
        
        let tableHTML = `<table class="history-table">
            <thead><tr>
                <th><i class="fa-regular fa-calendar-check"></i> Run At</th>
                <th><i class="fa-solid fa-arrow-up-9-1"></i> Priority</th>
                <th><i class="fa-solid fa-flag"></i> Trạng thái</th>
                <th><i class="fa-solid fa-star"></i> Điểm VMAF</th>
            </tr></thead>
            <tbody>`;
            
        historyList.forEach(h => {
            const dateStr = new Date(h.runAt).toLocaleString('vi-VN');
            const scoreHtml = getScoreHtml(h.score, h.trackingStatus, h.evaluationResult);
            const dStatus = getDisplayStatus(h.trackingStatus, h.evaluationResult);
            tableHTML += `<tr>
                <td>${dateStr}</td>
                <td>${h.convertPriority || '-'}</td>
                <td><span class="status-badge ${dStatus.class}"><i class="${dStatus.icon}"></i> ${dStatus.text}</span></td>
                <td>${scoreHtml}</td>
            </tr>`;
        });
        tableHTML += `</tbody></table>`;
        container.innerHTML = tableHTML;
        
    } catch(e) {
        container.innerHTML = '<div class="empty-state" style="color:var(--danger); padding:1rem;"><i class="fa-solid fa-triangle-exclamation"></i> Lỗi tải dữ liệu!</div>';
    }
}
