// Application state
let projects = [];
let currentView = 'cards';
let currentDate = new Date();
let currentProjectId = null;
let currentPostId = null;

// Initial data
const institutions = [
    "Instituto Realize",
    "APJ - Associação Política Jovem", 
    "CRIAR - Coletivo Renovação"
];

const teamMembers = [
    { name: "Rodrigo", role: "Diretor de Marketing e Comunicação" },
    { name: "Marcelo", role: "Assistente de Mídias Sociais" },
    { name: "Beto", role: "Diretor de Arte e Motion Designer" },
    { name: "Isa", role: "Jornalista - Relações Públicas" },
    { name: "Henrique", role: "Gestor Geral" },
    { name: "Daniel", role: "Gestor Geral" }
];

const statusOptions = ["Em Briefing", "Em Execução", "Parado", "Cancelado", "Postado"];
const postTypes = ["Teaser", "Inscrições", "Countdown", "Evento", "Pós-evento"];

// Initialize projects with sample data
function initializeProjects() {
    const initialProjects = [
        { name: "APJ EM AÇÃO", date: "2025-08-01", location: "Cuiabá 4 Bairros", institution: "APJ - Associação Política Jovem" },
        { name: "4º REALIZAÇÃO", date: "2025-08-01", location: "Cuiabá 4 Bairros", institution: "Instituto Realize" },
        { name: "2º ARRAIÁ EU AMO O XINGÚ", date: "2025-08-15", location: "São José do Xingú", institution: "Instituto Realize" },
        { name: "FESTA DO PARI", date: "2025-08-09", location: "Barra do Pari", institution: "Instituto Realize" },
        { name: "COPINHA CLÁSSICO DAS COMUNIDADES", date: "2025-08-09", location: "Dom Aquino", institution: "Instituto Realize" },
        { name: "2º TORNEIO BEACH TENNIS", date: "2025-08-06", location: "Círculo Militar", institution: "Instituto Realize" },
        { name: "DVD VOZES MT", date: "2025-09-08", location: "Malcom Pub", institution: "Instituto Realize" },
        { name: "2º CIRCUITO CUIABANO DE FUTEBOL", date: "2025-08-02", location: "Cuiabá", institution: "Instituto Realize" }
    ];

    projects = initialProjects.map((project, index) => ({
        id: index + 1,
        name: project.name,
        date: project.date,
        location: project.location,
        institution: project.institution,
        responsible: ["Rodrigo", "Marcelo"], // Default responsible
        description: `Projeto ${project.name} - ${project.location}`,
        posts: []
    }));
}

// Utility functions
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getStatusClass(status) {
    return status.toLowerCase().replace(/\s+/g, '-');
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Filter functions
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const institutionFilter = document.getElementById('institutionFilter').value;
    const responsibleFilter = document.getElementById('responsibleFilter').value;

    let filteredProjects = [...projects];

    if (statusFilter || institutionFilter || responsibleFilter) {
        filteredProjects = projects.filter(project => {
            let matchesStatus = true;
            let matchesInstitution = true;
            let matchesResponsible = true;

            if (statusFilter) {
                matchesStatus = project.posts.some(post => post.status === statusFilter);
                if (project.posts.length === 0) matchesStatus = false;
            }
            if (institutionFilter) {
                matchesInstitution = project.institution === institutionFilter;
            }
            if (responsibleFilter) {
                matchesResponsible = project.responsible.includes(responsibleFilter);
            }

            return matchesStatus && matchesInstitution && matchesResponsible;
        });
    }

    if (currentView === 'cards') {
        renderProjectCards(filteredProjects);
    } else {
        renderCalendar();
    }
}

// Project rendering functions
function renderProjectCards(projectsToRender = projects) {
    const container = document.getElementById('projectsGrid');
    
    if (projectsToRender.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <p>Nenhum projeto encontrado</p>
            </div>
        `;
        return;
    }

    container.innerHTML = projectsToRender.map(project => `
        <div class="project-card" data-project-id="${project.id}">
            <div class="project-card-header">
                <h3 class="project-card-title">${project.name}</h3>
                <span class="project-card-date">${formatDate(project.date)}</span>
            </div>
            <div class="project-card-info">
                <p><strong>Local:</strong> ${project.location}</p>
                <p><strong>Instituição:</strong> ${project.institution}</p>
                <p><strong>Responsáveis:</strong> ${project.responsible.join(', ')}</p>
            </div>
            <div class="project-card-footer">
                <span class="project-posts-count">${project.posts.length} posts</span>
                <div class="project-responsible">
                    ${project.responsible.map(resp => `
                        <span class="responsible-tag">${resp}</span>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // Add click handlers to project cards
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', function() {
            const projectId = parseInt(this.dataset.projectId);
            openProjectDetails(projectId);
        });
    });
}

// Calendar rendering functions
function renderCalendar() {
    const container = document.getElementById('calendarGrid');
    const monthYear = document.getElementById('currentMonth');
    
    if (!container || !monthYear) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthYear.textContent = new Date(year, month).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
    });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    let calendarHTML = '';
    
    // Day headers
    days.forEach(day => {
        calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });
    
    // Calendar days
    for (let i = 0; i < 42; i++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = cellDate.getMonth() === month;
        const isToday = cellDate.toDateString() === new Date().toDateString();
        const dateString = cellDate.toISOString().split('T')[0];
        
        const dayProjects = projects.filter(project => project.date === dateString);
        
        let dayClass = 'calendar-day';
        if (!isCurrentMonth) dayClass += ' other-month';
        if (isToday) dayClass += ' today';
        
        calendarHTML += `
            <div class="${dayClass}">
                <div class="calendar-day-number">${cellDate.getDate()}</div>
                ${dayProjects.map(project => `
                    <div class="calendar-event" data-project-id="${project.id}" title="${project.name}">
                        ${project.name}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    container.innerHTML = calendarHTML;
    
    // Add click handlers to calendar events
    document.querySelectorAll('.calendar-event').forEach(event => {
        event.addEventListener('click', function(e) {
            e.stopPropagation();
            const projectId = parseInt(this.dataset.projectId);
            openProjectDetails(projectId);
        });
    });
}

// Project details functions
function openProjectDetails(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    currentProjectId = projectId;
    
    document.getElementById('projectDetailsTitle').textContent = project.name;
    document.getElementById('projectDetailsDate').textContent = formatDate(project.date);
    document.getElementById('projectDetailsLocation').textContent = project.location;
    document.getElementById('projectDetailsInstitution').textContent = project.institution;
    document.getElementById('projectDetailsResponsible').textContent = project.responsible.join(', ');
    
    renderProjectPosts(project.posts);
    showModal('projectDetailsModal');
}

function renderProjectPosts(posts) {
    const container = document.getElementById('postsList');
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <p>Nenhum post criado ainda</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="post-item">
            <div class="post-item-header">
                <h4 class="post-item-title">${post.title}</h4>
                <div class="post-item-actions">
                    <button class="btn btn--secondary btn-icon" data-post-id="${post.id}" data-action="edit" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn btn--secondary btn-icon" data-post-id="${post.id}" data-action="delete" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="post-item-info">
                <span class="post-type-tag">${post.type}</span>
                <span class="status status--${getStatusClass(post.status)}">${post.status}</span>
                <span><strong>Responsável:</strong> ${post.responsible}</span>
            </div>
            ${post.description ? `<p class="post-item-description">${post.description}</p>` : ''}
        </div>
    `).join('');
    
    // Add click handlers to post action buttons
    document.querySelectorAll('.post-item-actions button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const postId = this.dataset.postId;
            const action = this.dataset.action;
            
            if (action === 'edit') {
                editPost(postId);
            } else if (action === 'delete') {
                deletePost(postId);
            }
        });
    });
}

// Post management functions
function openPostModal(postId = null) {
    currentPostId = postId;
    const form = document.getElementById('postForm');
    const title = document.getElementById('postModalTitle');
    
    if (postId) {
        const project = projects.find(p => p.id === currentProjectId);
        const post = project.posts.find(p => p.id === postId);
        
        if (post) {
            title.textContent = 'Editar Post';
            document.getElementById('postTitle').value = post.title;
            document.getElementById('postType').value = post.type;
            document.getElementById('postDescription').value = post.description;
            document.getElementById('postStatus').value = post.status;
            document.getElementById('postResponsible').value = post.responsible;
        }
    } else {
        title.textContent = 'Adicionar Post';
        form.reset();
    }
    
    showModal('postModal');
}

function savePost() {
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    const postData = {
        title: document.getElementById('postTitle').value,
        type: document.getElementById('postType').value,
        description: document.getElementById('postDescription').value,
        status: document.getElementById('postStatus').value,
        responsible: document.getElementById('postResponsible').value
    };
    
    if (currentPostId) {
        const postIndex = project.posts.findIndex(p => p.id === currentPostId);
        if (postIndex !== -1) {
            project.posts[postIndex] = { ...project.posts[postIndex], ...postData };
        }
    } else {
        const newPost = {
            id: generateId(),
            ...postData,
            createdAt: new Date().toISOString()
        };
        project.posts.push(newPost);
    }
    
    renderProjectPosts(project.posts);
    hideModal('postModal');
    applyFilters(); // Refresh the view
}

function editPost(postId) {
    openPostModal(postId);
}

function deletePost(postId) {
    if (confirm('Tem certeza que deseja excluir este post?')) {
        const project = projects.find(p => p.id === currentProjectId);
        if (project) {
            project.posts = project.posts.filter(p => p.id !== postId);
            renderProjectPosts(project.posts);
            applyFilters(); // Refresh the view
        }
    }
}

// Project creation functions
function createProject() {
    const responsible = Array.from(document.querySelectorAll('input[name="responsible"]:checked')).map(cb => cb.value);
    
    const newProject = {
        id: generateId(),
        name: document.getElementById('projectName').value,
        date: document.getElementById('projectDate').value,
        location: document.getElementById('projectLocation').value,
        institution: document.getElementById('projectInstitution').value,
        responsible: responsible,
        description: document.getElementById('projectDescription').value,
        posts: []
    };
    
    projects.push(newProject);
    document.getElementById('projectForm').reset();
    hideModal('projectModal');
    applyFilters();
}

// View switching functions
function switchView(view) {
    currentView = view;
    
    // Update button states
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-view="${view}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Show/hide views
    const projectsGrid = document.getElementById('projectsGrid');
    const calendarView = document.getElementById('calendarView');
    
    if (view === 'cards') {
        projectsGrid.style.display = 'grid';
        calendarView.classList.add('hidden');
        applyFilters();
    } else {
        projectsGrid.style.display = 'none';
        calendarView.classList.remove('hidden');
        renderCalendar();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    initializeProjects();
    
    // Render initial view
    renderProjectCards();
    
    // Modal event listeners
    const createProjectBtn = document.getElementById('createProjectBtn');
    if (createProjectBtn) {
        createProjectBtn.addEventListener('click', function() {
            document.getElementById('projectForm').reset();
            showModal('projectModal');
        });
    }
    
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', () => hideModal('projectModal'));
    }
    
    const cancelProject = document.getElementById('cancelProject');
    if (cancelProject) {
        cancelProject.addEventListener('click', () => hideModal('projectModal'));
    }
    
    const closeDetailsModal = document.getElementById('closeDetailsModal');
    if (closeDetailsModal) {
        closeDetailsModal.addEventListener('click', () => hideModal('projectDetailsModal'));
    }
    
    const addPostBtn = document.getElementById('addPostBtn');
    if (addPostBtn) {
        addPostBtn.addEventListener('click', () => openPostModal());
    }
    
    const closePostModal = document.getElementById('closePostModal');
    if (closePostModal) {
        closePostModal.addEventListener('click', () => hideModal('postModal'));
    }
    
    const cancelPost = document.getElementById('cancelPost');
    if (cancelPost) {
        cancelPost.addEventListener('click', () => hideModal('postModal'));
    }
    
    // Form submissions
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createProject();
        });
    }
    
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePost();
        });
    }
    
    // Filter event listeners
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    const institutionFilter = document.getElementById('institutionFilter');
    if (institutionFilter) {
        institutionFilter.addEventListener('change', applyFilters);
    }
    
    const responsibleFilter = document.getElementById('responsibleFilter');
    if (responsibleFilter) {
        responsibleFilter.addEventListener('change', applyFilters);
    }
    
    // View toggle event listeners
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchView(this.dataset.view);
        });
    });
    
    // Calendar navigation
    const prevMonth = document.getElementById('prevMonth');
    if (prevMonth) {
        prevMonth.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }
    
    const nextMonth = document.getElementById('nextMonth');
    if (nextMonth) {
        nextMonth.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }
    
    // Close modal on outside click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            const modalId = e.target.id;
            hideModal(modalId);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close any open modal
            document.querySelectorAll('.modal.show').forEach(modal => {
                hideModal(modal.id);
            });
        }
    });
});