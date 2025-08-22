// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    getDoc,
    getDocs, 
    setDoc, 
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDsZP0XHlMW8c2xzIYqrqL6cUmEXTKW8z4",
    authDomain: "inventario-geo.firebaseapp.com",
    projectId: "inventario-geo",
    storageBucket: "inventario-geo.appspot.com",
    messagingSenderId: "524196226889",
    appId: "1:524196226889:web:e7b541acba8c233cce9c98",
    measurementId: "G-536S07XZ4T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos do DOM ---
    const loginBackdrop = document.getElementById('loginBackdrop');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterLink = document.getElementById('showRegisterLink');
    const showLoginLink = document.getElementById('showLoginLink');
    const appContainer = document.getElementById('appContainer');
    const loggedInUserSpan = document.getElementById('loggedInUser');
    const userRoleSpan = document.getElementById('userRole');
    const logoutBtn = document.getElementById('logoutBtn');
    const manageUsersBtn = document.getElementById('manageUsersBtn');
    const userManagementModal = document.getElementById('userManagementModal');
    const registerUserForm = document.getElementById('registerUserForm');
    const closeUserManagementBtn = document.getElementById('closeUserManagementBtn');
    const userListDiv = document.getElementById('userList');
    const adminRoleOption = document.getElementById('adminRoleOption');
    
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const searchInput = document.getElementById('searchInput');
    const addItemBtn = document.getElementById('addItemBtn');
    const itemModal = document.getElementById('itemModal');
    const modalTitle = document.getElementById('modalTitle');
    const itemForm = document.getElementById('itemForm');
    const itemTypeSelect = document.getElementById('itemType');
    const itemClassContainer = document.getElementById('itemClassContainer');
    const cancelItemBtn = document.getElementById('cancelItemBtn');
    const imagePreview = document.getElementById('imagePreview');
    const itemImageInput = document.getElementById('itemImage');

    const stockModal = document.getElementById('stockModal');
    const stockModalTitle = document.getElementById('stockModalTitle');
    const stockForm = document.getElementById('stockForm');
    const cancelStockBtn = document.getElementById('cancelStockBtn');

    const unitManagementModal = document.getElementById('unitManagementModal');
    const unitManagementTitle = document.getElementById('unitManagementTitle');
    const unitManagementItemName = document.getElementById('unitManagementItemName');
    const unitList = document.getElementById('unitList');
    const closeUnitManagementBtn = document.getElementById('closeUnitManagementBtn');

    const assignUnitModal = document.getElementById('assignUnitModal');
    const assignUnitForm = document.getElementById('assignUnitForm');
    const assignUnitModalTitle = document.getElementById('assignUnitModalTitle');
    const assignUnitToLabel = document.getElementById('assignUnitToLabel');
    const assignUnitToContainer = document.getElementById('assignUnitToContainer');
    const assignUnitPeriodContainer = document.getElementById('assignUnitPeriodContainer');
    const assignUnitIdentifierContainer = document.getElementById('assignUnitIdentifierContainer');
    const assignUnitIndefinite = document.getElementById('assignUnitIndefinite');
    const assignUnitPeriod = document.getElementById('assignUnitPeriod');
    const cancelAssignUnitBtn = document.getElementById('cancelAssignUnitBtn');

    const fleetManagementModal = document.getElementById('fleetManagementModal');
    const fleetForm = document.getElementById('fleetForm');
    const fleetList = document.getElementById('fleetList');
    const manageFleetsBtn = document.getElementById('manageFleetsBtn');
    const closeFleetManagementBtn = document.getElementById('closeFleetManagementBtn');
    
    const fleetItemsModal = document.getElementById('fleetItemsModal');
    const fleetItemsName = document.getElementById('fleetItemsName');
    const fleetItemsList = document.getElementById('fleetItemsList');
    const closeFleetItemsBtn = document.getElementById('closeFleetItemsBtn');

    const historyModal = document.getElementById('historyModal');
    const historyItemName = document.getElementById('historyItemName');
    const historyLogBody = document.getElementById('historyLogBody');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    
    const viewDeletedBtn = document.getElementById('viewDeletedBtn');
    const deletedItemsModal = document.getElementById('deletedItemsModal');
    const deletedItemsBody = document.getElementById('deletedItemsBody');
    const closeDeletedItemsBtn = document.getElementById('closeDeletedItemsBtn');

    const exportBtn = document.getElementById('exportBtn');
    const exportLogBtn = document.getElementById('exportLogBtn');
    const clearLogBtn = document.getElementById('clearLogBtn');

    const notificationsBtn = document.getElementById('notificationsBtn');
    const notificationBadge = document.getElementById('notificationBadge');
    const notificationsModal = document.getElementById('notificationsModal');
    const notificationsList = document.getElementById('notificationsList');
    const closeNotificationsBtn = document.getElementById('closeNotificationsBtn');

    // --- Estado da Aplicação ---
    let inventoryItems = [];
    let fleets = [];
    let users = [];
    let imageBase64 = null;
    let currentUser = null;
    let currentUserData = null; // Para armazenar dados do Firestore (role, etc)
    
    // --- Funções de Autenticação e UI ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            if (!user.emailVerified) {
                alert("Por favor, verifique seu email para continuar. Clique no link que enviamos para você.");
                await signOut(auth);
                return;
            }
            currentUser = user;
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                currentUserData = userDocSnap.data();
                showApp();
            } else {
                console.error("Documento do usuário não encontrado no Firestore. Deslogando.");
                await signOut(auth);
            }
        } else {
            currentUser = null;
            currentUserData = null;
            showLogin();
        }
    });

    const showLogin = () => {
        loginBackdrop.classList.remove('hidden');
        appContainer.classList.add('hidden');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    };

    const showApp = () => {
        loginBackdrop.classList.add('hidden');
        appContainer.classList.remove('hidden');
        loggedInUserSpan.textContent = currentUserData.username;
        userRoleSpan.textContent = currentUserData.role.charAt(0).toUpperCase() + currentUserData.role.slice(1);
        
        const isAdmin = currentUserData.role === 'admin';
        const isEditor = currentUserData.role === 'editor';

        document.querySelectorAll('.admin-only').forEach(el => el.classList.toggle('hidden', !isAdmin));
        document.querySelectorAll('.admin-editor-only').forEach(el => el.classList.toggle('hidden', !(isAdmin || isEditor)));
        
        listenForInventoryUpdates();
        listenForFleetUpdates();
    };
    
    const addHistoryRecord = (item, action, details) => {
        if (!item.history) {
            item.history = [];
        }
        item.history.unshift({
            timestamp: new Date().toISOString(),
            user: currentUserData.username,
            action: action,
            details: details
        });
    };

    // --- Funções de Listener (Tempo Real) ---
    let unsubscribeInventory = null;
    const listenForInventoryUpdates = () => {
        if (unsubscribeInventory) unsubscribeInventory(); // Cancela listener anterior
        const q = query(collection(db, "inventory"));
        unsubscribeInventory = onSnapshot(q, (querySnapshot) => {
            inventoryItems = [];
            querySnapshot.forEach((doc) => {
                inventoryItems.push({ docId: doc.id, ...doc.data() });
            });
            updateNotifications();
            renderTable();
        }, (error) => {
            console.error("Erro no listener de inventário:", error);
            if (error.code === 'permission-denied') {
                alert("Erro de Permissão: Verifique se as regras de segurança do Firestore estão configuradas corretamente no console do Firebase para permitir leitura por usuários autenticados.");
            }
        });
    };

    let unsubscribeFleets = null;
    const listenForFleetUpdates = () => {
        if (unsubscribeFleets) unsubscribeFleets();
        const q = query(collection(db, "fleets"));
        unsubscribeFleets = onSnapshot(q, (querySnapshot) => {
            fleets = [];
            querySnapshot.forEach((doc) => {
                fleets.push({ id: doc.id, ...doc.data() });
            });
        }, (error) => {
            console.error("Erro no listener de frotas:", error);
            if (error.code === 'permission-denied') {
                alert("Erro de Permissão: Verifique se as regras de segurança do Firestore estão configuradas corretamente no console do Firebase para permitir leitura por usuários autenticados.");
            }
        });
    };

    // --- Funções da Tabela ---
    const renderTable = (filter = '') => {
        const searchFilter = filter || searchInput.value;
        inventoryTableBody.innerHTML = '';
        const activeItems = inventoryItems.filter(item => !item.isDeleted);
        const filteredItems = activeItems.filter(item => 
            item && typeof item.name === 'string' && item.name.toLowerCase().includes(searchFilter.toLowerCase())
        );

        if (filteredItems.length === 0) {
            inventoryTableBody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-gray-500">Nenhum item encontrado.</td></tr>`;
            return;
        }
        filteredItems.forEach(item => {
            const row = document.createElement('tr');
            row.className = `border-b hover:bg-gray-100 ${item.quantity === 0 && item.type === 'consumivel' ? 'bg-gray-50 text-gray-400' : ''}`;
            const lastChange = item.history ? item.history[0] : null;
            
            const isAdminOrEditor = currentUserData.role === 'admin' || currentUserData.role === 'editor';
            
            let statusOrQtyCell = '';
            let actionButtons = `<button onclick="handleHistory('${item.docId}')" class="text-purple-500 hover:text-purple-700" title="Ver Histórico"><i class="fas fa-history"></i></button>`;

            if (item.type === 'ferramenta' || item.type === 'atribuido') {
                const units = item.units || [];
                const inUseCount = units.filter(u => u.status !== 'disponivel').length;
                statusOrQtyCell = `<div class="font-semibold">${inUseCount} de ${item.quantity} em uso</div>`;
                actionButtons += `<button onclick="handleManageUnits('${item.docId}')" class="text-indigo-500 hover:text-indigo-700" title="Gerenciar Unidades"><i class="fas fa-tasks"></i></button>`;
            } else { // Consumível
                statusOrQtyCell = `<div class="font-bold">${item.quantity}</div>`;
                actionButtons += `
                    <button onclick="handleStock('${item.docId}', 'Entrada')" class="text-green-500 hover:text-green-700" title="Registrar Entrada"><i class="fas fa-arrow-up"></i></button>
                    <button onclick="handleStock('${item.docId}', 'Saída')" class="text-yellow-500 hover:text-yellow-700" title="Registrar Saída"><i class="fas fa-arrow-down"></i></button>
                `;
            }
            
            if (isAdminOrEditor) {
                actionButtons += `
                    <button onclick="handleEdit('${item.docId}')" class="text-blue-500 hover:text-blue-700" title="Editar Item"><i class="fas fa-edit"></i></button>
                    <button onclick="handleDelete('${item.docId}')" class="text-red-500 hover:text-red-700" title="Remover Item"><i class="fas fa-trash"></i></button>
                `;
            }

            row.innerHTML = `
                <td class="py-3 px-4 font-semibold">${item.id}</td>
                <td class="py-3 px-4">
                    <img src="${item.imageData || 'https://placehold.co/60x60/e2e8f0/a0aec0?text=Sem+Img'}" alt="${item.name}" class="h-12 w-12 object-cover rounded-md">
                </td>
                <td class="py-3 px-4">
                    <div class="font-medium">${item.name}</div>
                    <div class="text-xs ${item.type === 'ferramenta' ? 'text-blue-500' : (item.type === 'atribuido' ? 'text-indigo-500' : 'text-gray-500')}">${item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'N/D'}</div>
                </td>
                <td class="py-3 px-4">${statusOrQtyCell}</td>
                <td class="py-3 px-4 text-sm">${lastChange ? `${lastChange.user} (${lastChange.action})` : 'N/A'}</td>
                <td class="py-3 px-4 text-sm">${lastChange ? new Date(lastChange.timestamp).toLocaleString('pt-BR') : 'N/A'}</td>
                <td class="py-3 px-4 text-center">
                    <div class="flex justify-center items-center gap-3">
                        ${actionButtons}
                    </div>
                </td>
            `;
            inventoryTableBody.appendChild(row);
        });
    };

    // --- Funções dos Modais ---
    const openItemModal = (item = null) => {
        itemForm.reset();
        imageBase64 = null;
        imagePreview.classList.add('hidden');
        imagePreview.src = '';
        itemClassContainer.classList.add('hidden');

        if (item) { // Modo Edição
            modalTitle.textContent = 'Editar Item';
            document.getElementById('originalItemId').value = item.docId;
            document.getElementById('itemId').value = item.id;
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemQuantity').value = item.quantity;
            document.getElementById('itemType').value = item.type || 'consumivel';
            if (item.type === 'atribuido') {
                itemClassContainer.classList.remove('hidden');
                document.getElementById('itemClass').value = item.class || '';
            }
            if (item.imageData) {
                imagePreview.src = item.imageData;
                imagePreview.classList.remove('hidden');
                imageBase64 = item.imageData;
            }
        } else { // Modo Adição
            modalTitle.textContent = 'Adicionar Novo Item';
            document.getElementById('originalItemId').value = '';
            const nextId = inventoryItems.length > 0 ? Math.max(...inventoryItems.map(i => parseInt(i.id) || 0)) + 1 : 1;
            document.getElementById('itemId').value = nextId;
        }
        
        const isUserRole = currentUserData.role === 'user';
        document.getElementById('itemId').disabled = isUserRole && !!item;
        document.getElementById('itemName').disabled = isUserRole && !!item;
        document.getElementById('itemType').disabled = isUserRole && !!item;
        
        itemModal.classList.remove('hidden');
    };

    const closeItemModal = () => itemModal.classList.add('hidden');
    
    const openStockModal = (item, type) => {
        stockForm.reset();
        stockModalTitle.textContent = `Registrar ${type} de ${item.name}`;
        document.getElementById('stockItemId').value = item.docId;
        document.getElementById('stockType').value = type;
        stockModal.classList.remove('hidden');
    };
    const closeStockModal = () => stockModal.classList.add('hidden');

    const openUnitManagementModal = (item) => {
        const isTool = item.type === 'ferramenta';
        unitManagementTitle.textContent = isTool ? 'Gerenciar Empréstimos' : 'Gerenciar Atribuições';
        unitManagementItemName.textContent = `${item.name} (ID: ${item.id})`;
        unitList.innerHTML = '';
        item.units.forEach(unit => {
            const unitDiv = document.createElement('div');
            unitDiv.className = 'flex flex-wrap justify-between items-center p-3 border rounded-md gap-2';
            let statusHTML = '';
            if (unit.status !== 'disponivel') {
                const target = isTool ? unit.lentTo : fleets.find(f => f.chassi === unit.assignedTo)?.name || unit.assignedTo;
                const period = isTool && unit.dueDate ? (unit.dueDate === 'Indefinido' ? '(Indefinido)' : `(Devolver até: ${new Date(unit.dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})})`) : '';
                const identifier = unit.identifier ? `<span class="text-xs text-gray-500 block">Nº Série: ${unit.identifier}</span>` : '';
                const actionText = isTool ? 'Devolver' : 'Remover';
                const actionFunc = isTool ? 'handleReturnUnit' : 'handleUnassignUnit';
                let extendButton = '';
                if (isTool) {
                    extendButton = `<button onclick="handleExtendLoan('${item.docId}', ${unit.unitId})" class="btn btn-yellow text-xs">Prorrogar</button>`;
                }
                statusHTML = `
                    <div class="flex-grow">
                        <p class="font-semibold">Unidade ${unit.unitId}</p>
                        <p class="text-sm text-yellow-600">${isTool ? 'Emprestado para' : 'Atribuído a'}: ${target} ${period}</p>
                        ${identifier}
                    </div>
                    <div class="flex gap-2">
                        ${extendButton}
                        <button onclick="${actionFunc}('${item.docId}', ${unit.unitId})" class="btn btn-red text-xs">${actionText}</button>
                    </div>
                `;
            } else {
                const actionText = isTool ? 'Emprestar' : 'Atribuir';
                const actionFunc = isTool ? 'handleLendUnit' : 'handleAssignUnit';
                statusHTML = `
                    <div>
                        <p class="font-semibold">Unidade ${unit.unitId}</p>
                        <p class="text-sm text-green-600">Disponível</p>
                    </div>
                    <button onclick="${actionFunc}('${item.docId}', ${unit.unitId})" class="btn btn-primary text-xs">${actionText}</button>
                `;
            }
            unitDiv.innerHTML = statusHTML;
            unitList.appendChild(unitDiv);
        });
        unitManagementModal.classList.remove('hidden');
    };
    const closeUnitManagementModal = () => unitManagementModal.classList.add('hidden');
    
    const openAssignUnitModal = (itemId, unitId, isTool) => {
        assignUnitForm.reset();
        document.getElementById('assignUnitItemId').value = itemId;
        document.getElementById('assignUnitUnitId').value = unitId;
        
        if (isTool) {
            assignUnitModalTitle.textContent = `Emprestar Unidade ${unitId}`;
            const toInput = document.createElement('input');
            toInput.type = 'text';
            toInput.id = 'assignUnitTo';
            toInput.className = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm';
            toInput.required = true;
            assignUnitToLabel.textContent = 'Emprestar para:';
            assignUnitToContainer.innerHTML = '';
            assignUnitToContainer.appendChild(toInput);
            
            assignUnitPeriodContainer.classList.remove('hidden');
            assignUnitIdentifierContainer.classList.add('hidden');
        } else {
            assignUnitModalTitle.textContent = `Atribuir Unidade ${unitId}`;
            assignUnitToLabel.textContent = 'Atribuir à Frota:';
            
            const fleetSelect = document.createElement('select');
            fleetSelect.id = 'assignUnitTo';
            fleetSelect.className = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm';
            fleets.forEach(fleet => {
                const option = document.createElement('option');
                option.value = fleet.chassi;
                option.textContent = `${fleet.name} (${fleet.model})`;
                fleetSelect.appendChild(option);
            });
            
            assignUnitToContainer.innerHTML = '';
            assignUnitToContainer.appendChild(fleetSelect);
            
            assignUnitPeriodContainer.classList.add('hidden');
            assignUnitIdentifierContainer.classList.remove('hidden');
        }
        
        assignUnitModal.classList.remove('hidden');
    };
    const closeAssignUnitModal = () => assignUnitModal.classList.add('hidden');
    
    const openUserManagementModal = () => {
        adminRoleOption.classList.toggle('hidden', currentUserData.username !== SUPER_ADMIN_USERNAME);
        renderUserList();
        userManagementModal.classList.remove('hidden');
    };
    const closeUserManagementModal = () => userManagementModal.classList.add('hidden');

    const openHistoryModal = (item) => {
        historyItemName.textContent = `${item.name} (ID: ${item.id})`;
        historyLogBody.innerHTML = '';
        if (item.history && item.history.length > 0) {
            item.history.forEach(log => {
                const row = document.createElement('tr');
                row.className = 'border-b';
                row.innerHTML = `
                    <td class="py-2 px-3">${new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                    <td class="py-2 px-3">${log.user}</td>
                    <td class="py-2 px-3 font-semibold">${log.action}</td>
                    <td class="py-2 px-3">${log.details}</td>
                `;
                historyLogBody.appendChild(row);
            });
        } else {
            historyLogBody.innerHTML = `<tr><td colspan="4" class="text-center py-4">Nenhum histórico para este item.</td></tr>`;
        }
        historyModal.classList.remove('hidden');
    };
    const closeHistoryModal = () => historyModal.classList.add('hidden');

    const openDeletedItemsModal = () => {
        deletedItemsBody.innerHTML = '';
        const deletedItems = inventoryItems.filter(item => item.isDeleted);
        if (deletedItems.length > 0) {
            deletedItems.forEach(item => {
                const deletionRecord = item.history.find(h => h.action === 'Exclusão');
                const row = document.createElement('tr');
                row.className = 'border-b';
                row.innerHTML = `
                    <td class="py-2 px-3">${item.id}</td>
                    <td class="py-2 px-3">${item.name}</td>
                    <td class="py-2 px-3">${deletionRecord ? deletionRecord.user : 'N/A'}</td>
                    <td class="py-2 px-3">${deletionRecord ? new Date(deletionRecord.timestamp).toLocaleString('pt-BR') : 'N/A'}</td>
                `;
                deletedItemsBody.appendChild(row);
            });
        } else {
            deletedItemsBody.innerHTML = `<tr><td colspan="4" class="text-center py-4">Nenhum item excluído.</td></tr>`;
        }
        deletedItemsModal.classList.remove('hidden');
    };
    const closeDeletedItemsModal = () => deletedItemsModal.classList.add('hidden');

    const openNotificationsModal = (overdueLoans) => {
        notificationsList.innerHTML = '';
        if (overdueLoans.length === 0) {
            notificationsList.innerHTML = '<p class="text-gray-500 text-center">Nenhum empréstimo vencido.</p>';
        } else {
            overdueLoans.forEach(loan => {
                const notificationDiv = document.createElement('div');
                notificationDiv.className = 'p-3 border rounded-md mb-2 bg-red-50 border-red-200';
                notificationDiv.innerHTML = `
                    <p class="font-semibold text-red-800">${loan.itemName} (Unidade ${loan.unitId})</p>
                    <p class="text-sm text-red-700">Emprestado para: <strong>${loan.lentTo}</strong></p>
                    <p class="text-sm text-red-700">Venceu há: <strong>${loan.daysOverdue} dia(s)</strong></p>
                `;
                notificationsList.appendChild(notificationDiv);
            });
        }
        notificationsModal.classList.remove('hidden');
    };
    const closeNotificationsModal = () => notificationsModal.classList.add('hidden');

    // --- Manipuladores de Eventos ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            alert('Email ou senha inválidos.');
            console.error("Erro de login:", error);
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await signOut(auth);
    });

    manageUsersBtn.addEventListener('click', openUserManagementModal);
    closeUserManagementBtn.addEventListener('click', closeUserManagementModal);
    viewDeletedBtn.addEventListener('click', openDeletedItemsModal);
    closeDeletedItemsBtn.addEventListener('click', closeDeletedItemsModal);

    registerUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('newUsername').value;
        const email = document.getElementById('newUserEmail').value;
        const password = document.getElementById('newPassword').value;
        const role = document.getElementById('newUserRole').value;
        
        try {
            // Primeiro, cria o usuário na autenticação do Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Depois, salva os detalhes (como nome e papel) no Firestore
            const newUser = {
                uid: userCredential.user.uid,
                email: email,
                username: username,
                role: role
            };
            await setDoc(doc(db, "users", userCredential.user.uid), newUser);
            alert(`Usuário '${username}' cadastrado com sucesso!`);
            registerUserForm.reset();
            renderUserList();
        } catch (error) {
            alert(`Erro ao cadastrar usuário: ${error.message}`);
            console.error("Erro de cadastro:", error);
        }
    });
    
    searchInput.addEventListener('input', (e) => renderTable(e.target.value));
    addItemBtn.addEventListener('click', () => openItemModal());
    cancelItemBtn.addEventListener('click', closeItemModal);
    cancelStockBtn.addEventListener('click', closeStockModal);
    closeUnitManagementBtn.addEventListener('click', closeUnitManagementModal);
    cancelAssignUnitBtn.addEventListener('click', closeAssignUnitModal);
    closeHistoryBtn.addEventListener('click', closeHistoryModal);

    itemTypeSelect.addEventListener('change', (e) => {
        itemClassContainer.classList.toggle('hidden', e.target.value !== 'atribuido');
    });

    itemImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageBase64 = e.target.result;
                imagePreview.src = imageBase64;
                imagePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    itemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const docId = document.getElementById('originalItemId').value;
        const newId = document.getElementById('itemId').value;
        const name = document.getElementById('itemName').value;
        const quantity = parseInt(document.getElementById('itemQuantity').value);
        const type = document.getElementById('itemType').value;
        const itemClass = document.getElementById('itemClass').value;

        // Lógica de validação de ID único (precisa ser assíncrona com Firestore)
        // ... (implementação mais robusta seria necessária para produção)

        if (docId) { // Atualizar item
            const itemRef = doc(db, "inventory", docId);
            const item = inventoryItems.find(i => i.docId === docId);
            
            let changes = [];
            if (item.id !== newId) changes.push(`ID alterado de '${item.id}' para '${newId}'`);
            if (item.name !== name) changes.push(`Nome alterado de '${item.name}' para '${name}'`);
            if (item.type !== type) changes.push(`Tipo alterado de '${item.type}' para '${type}'`);
            if (item.class !== itemClass) changes.push(`Classe alterada para '${itemClass}'`);
            
            if ((item.type === 'atribuido' || item.type === 'ferramenta') && item.quantity !== quantity) {
                const oldQty = item.quantity;
                const inUseUnits = item.units.filter(u => u.status !== 'disponivel').length;
                if (quantity < inUseUnits) {
                    alert(`Não é possível reduzir a quantidade para ${quantity}, pois existem ${inUseUnits} unidades atualmente em uso.`);
                    return;
                }
                changes.push(`Quantidade alterada de '${oldQty}' para '${quantity}'`);
                const diff = quantity - item.units.length;
                if (diff > 0) {
                    for (let i = 0; i < diff; i++) {
                        item.units.push({ unitId: item.units.length + 1, status: 'disponivel' });
                    }
                } else if (diff < 0) {
                    let toRemove = Math.abs(diff);
                    item.units = item.units.filter(unit => {
                        if (unit.status === 'disponivel' && toRemove > 0) {
                            toRemove--;
                            return false;
                        }
                        return true;
                    });
                }
            } else if (item.quantity !== quantity) {
                 changes.push(`Quantidade alterada de '${item.quantity}' para '${quantity}'`);
            }
            
            if (changes.length > 0) {
                addHistoryRecord(item, 'Edição', changes.join(', '));
            }
            
            const updatedData = { ...item, id: newId, name, quantity, type, imageData: imageBase64 || item.imageData };
            if (type === 'atribuido') updatedData.class = itemClass;
            delete updatedData.docId; // Não salvar o docId dentro do documento
            await updateDoc(itemRef, updatedData);

        } else { // Adicionar item
            const newItem = {
                id: newId, name, quantity, type, imageData: imageBase64, history: [], isDeleted: false
            };
            if (type === 'ferramenta' || type === 'atribuido') {
                newItem.units = [];
                for (let i = 1; i <= quantity; i++) {
                    newItem.units.push({ unitId: i, status: 'disponivel' });
                }
            }
            if (type === 'atribuido') {
                newItem.class = itemClass;
            }
            addHistoryRecord(newItem, 'Criação', `Item criado com ${quantity} unidades.`);
            await addDoc(collection(db, "inventory"), newItem);
        }
        closeItemModal();
    });
    
    stockForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const docId = document.getElementById('stockItemId').value;
        const type = document.getElementById('stockType').value;
        const quantity = parseInt(document.getElementById('stockQuantity').value);
        
        const item = inventoryItems.find(i => i.docId == docId);
        if (item) {
            if (type === 'Saída' && item.quantity < quantity) {
                alert('Quantidade de saída excede o estoque atual.');
                return;
            }
            
            const oldQty = item.quantity;
            const newQty = type === 'Entrada' ? item.quantity + quantity : item.quantity - quantity;
            const details = `Quantidade: ${quantity}. Estoque alterado de ${oldQty} para ${newQty}.`;
            addHistoryRecord(item, type, details);
            
            const itemRef = doc(db, "inventory", docId);
            await updateDoc(itemRef, {
                quantity: newQty,
                history: item.history
            });
            
            closeStockModal();
        }
    });

    assignUnitForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const itemId = document.getElementById('assignUnitItemId').value;
        const unitId = parseInt(document.getElementById('assignUnitUnitId').value);
        const to = document.getElementById('assignUnitTo').value;
        const period = document.getElementById('assignUnitPeriod').value;
        const isIndefinite = document.getElementById('assignUnitIndefinite').checked;
        const identifier = document.getElementById('assignUnitIdentifier').value;

        const item = inventoryItems.find(i => i.docId === itemId);
        const unit = item.units.find(u => u.unitId === unitId);

        if (item.type === 'ferramenta') {
            unit.status = 'emprestada';
            unit.lentTo = to;
            unit.loanDate = new Date().toISOString();
            if (isIndefinite) {
                unit.dueDate = 'Indefinido';
                addHistoryRecord(item, 'Empréstimo', `Unidade ${unitId} emprestada para ${to} (prazo indefinido).`);
            } else {
                unit.dueDate = period;
                addHistoryRecord(item, 'Empréstimo', `Unidade ${unitId} emprestada para ${to} (devolução em ${new Date(period).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}).`);
            }
        } else { // Atribuído
            const fleet = fleets.find(f => f.chassi === to);
            const alreadyAssigned = inventoryItems.some(invItem => 
                invItem.type === 'atribuido' &&
                invItem.class === item.class &&
                invItem.docId !== item.docId && // Exclui o próprio item da verificação
                invItem.units.some(u => u.assignedTo === to)
            );

            if (alreadyAssigned) {
                alert(`Erro: A frota '${fleet.name}' já possui um item da classe '${item.class}' atribuído.`);
                return;
            }

            unit.status = 'atribuido';
            unit.assignedTo = to;
            unit.identifier = identifier;
            addHistoryRecord(item, 'Atribuição', `Unidade ${unitId} (ID: ${identifier}) atribuída a ${fleet.name}.`);
        }
        
        const itemRef = doc(db, "inventory", itemId);
        await updateDoc(itemRef, {
            units: item.units,
            history: item.history
        });

        openUnitManagementModal(item);
        closeAssignUnitModal();
    });

    // --- Funções Globais para Ações da Tabela ---
    window.handleEdit = (docId) => {
        const item = inventoryItems.find(i => i.docId === docId);
        if (item) openItemModal(item);
    };

    window.handleDelete = async (docId) => {
        if (confirm('Tem certeza que deseja remover este item? Ele será movido para o log de excluídos.')) {
            const item = inventoryItems.find(i => i.docId === docId);
            if (item) {
                addHistoryRecord(item, 'Exclusão', 'Item marcado como excluído.');
                const itemRef = doc(db, "inventory", docId);
                await updateDoc(itemRef, {
                    isDeleted: true,
                    history: item.history
                });
            }
        }
    };
    
    window.handleStock = (docId, type) => {
        const item = inventoryItems.find(i => i.docId === docId);
        if (item) openStockModal(item, type);
    };

    window.handleManageUnits = (docId) => {
        const item = inventoryItems.find(i => i.docId === docId);
        if(item) openUnitManagementModal(item);
    };

    window.handleLendUnit = (itemId, unitId) => {
        openAssignUnitModal(itemId, unitId, true);
    };

    window.handleReturnUnit = async (itemId, unitId) => {
        const item = inventoryItems.find(i => i.docId === itemId);
        const unit = item.units.find(u => u.unitId === unitId);
        if (confirm(`Confirmar a devolução da Unidade ${unitId}?`)) {
            addHistoryRecord(item, 'Devolução', `Unidade ${unitId} devolvida por ${unit.lentTo}.`);
            unit.status = 'disponivel';
            delete unit.lentTo;
            delete unit.loanDate;
            delete unit.dueDate;
            
            const itemRef = doc(db, "inventory", itemId);
            await updateDoc(itemRef, {
                units: item.units,
                history: item.history
            });
            openUnitManagementModal(item);
        }
    };

    window.handleAssignUnit = (itemId, unitId) => {
        openAssignUnitModal(itemId, unitId, false);
    };

    window.handleUnassignUnit = async (itemId, unitId) => {
        const item = inventoryItems.find(i => i.docId === itemId);
        const unit = item.units.find(u => u.unitId === unitId);
        if (confirm(`Remover atribuição da Unidade ${unitId} de ${unit.assignedTo}?`)) {
            addHistoryRecord(item, 'Remoção de Atribuição', `Atribuição da Unidade ${unitId} (ID: ${unit.identifier}) removida de ${unit.assignedTo}.`);
            unit.status = 'disponivel';
            delete unit.assignedTo;
            delete unit.identifier;
            
            const itemRef = doc(db, "inventory", itemId);
            await updateDoc(itemRef, {
                units: item.units,
                history: item.history
            });
            openUnitManagementModal(item);
        }
    };

    window.handleHistory = (docId) => {
        const item = inventoryItems.find(i => i.docId === docId);
        if (item) openHistoryModal(item);
    };

    // --- Lógica de Gerenciamento de Usuários ---
    const renderUserList = async () => {
        userListDiv.innerHTML = '';
        const usersSnapshot = await getDocs(collection(db, "users"));
        users = [];
        usersSnapshot.forEach(doc => users.push({ id: doc.id, ...doc.data()}));

        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'flex justify-between items-center p-2 border rounded-md';
            
            let buttons = '';
            const canBeManaged = user.email !== SUPER_ADMIN_EMAIL && (currentUserData.role === 'admin' || (currentUserData.role === 'editor' && user.role !== 'admin'));

            if (canBeManaged) {
                buttons = `
                    <button onclick="handleChangeRole('${user.id}')" class="text-blue-500 hover:text-blue-700 text-sm" title="Mudar Papel"><i class="fas fa-user-shield"></i></button>
                    <button onclick="handleDeleteUser('${user.id}')" class="text-red-500 hover:text-red-700 text-sm" title="Excluir Usuário"><i class="fas fa-user-times"></i></button>
                `;
            } else if (user.uid === currentUser.uid) {
                buttons = '<span class="text-xs text-gray-400">Atual</span>';
            }

            userDiv.innerHTML = `
                <div>
                    <p class="font-semibold">${user.username}</p>
                    <p class="text-sm text-gray-500">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                </div>
                <div class="flex gap-2">
                    ${buttons}
                </div>
            `;
            userListDiv.appendChild(userDiv);
        });
    };

    window.handleChangeRole = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            const newRole = prompt(`Digite o novo papel para '${user.username}' (admin, editor, user):`, user.role);
            if (newRole && ['admin', 'editor', 'user'].includes(newRole)) {
                if (newRole === 'admin' && currentUserData.email !== SUPER_ADMIN_EMAIL) {
                    alert('Apenas o admin principal pode designar outros admins.');
                    return;
                }
                const userRef = doc(db, "users", userId);
                await updateDoc(userRef, { role: newRole });
                renderUserList();
            } else if (newRole !== null) {
                alert('Papel inválido.');
            }
        }
    };

    window.handleDeleteUser = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (confirm(`Tem certeza que deseja excluir o usuário '${user.username}'? Esta ação não pode ser desfeita.`)) {
            // ATENÇÃO: A exclusão de usuários no Firebase Auth não é feita por aqui por segurança.
            // Isso deve ser feito no console do Firebase ou usando o Admin SDK em um backend.
            // Aqui, apenas removeremos o registro do Firestore.
            await deleteDoc(doc(db, "users", userId));
            renderUserList();
        }
    };

    // --- Lógica de Ações de Admin ---
    clearLogBtn.addEventListener('click', async () => {
        const password = prompt('Para confirmar a limpeza de TODO o histórico, digite sua senha de admin:');
        if (password === null) return;
        
        // Reautenticação não é simples no cliente, esta é uma verificação básica.
        // Em um app de produção, seria necessário um backend ou reautenticação.
        alert("Funcionalidade de limpeza de log em desenvolvimento.");
    });

    // --- Lógica de Exportação ---
    exportBtn.addEventListener('click', () => {
        const activeItems = inventoryItems.filter(item => !item.isDeleted);
        
        const mainData = [];
        const loansData = [];
        const assignmentsData = [];

        activeItems.forEach(item => {
            const lastChange = item.history ? item.history[0] : null;
            let statusOrQty = '';

            if (item.type === 'ferramenta' || item.type === 'atribuido') {
                const inUseCount = item.units ? item.units.filter(u => u.status !== 'disponivel').length : 0;
                statusOrQty = `${inUseCount} de ${item.quantity} em uso`;
                
                if (item.units) {
                    item.units.forEach(unit => {
                        if (unit.status !== 'disponivel') {
                            if (item.type === 'ferramenta') {
                                loansData.push({
                                    'ID do Item': item.id,
                                    'Nome do Item': item.name,
                                    'Unidade': unit.unitId,
                                    'Emprestada para': unit.lentTo,
                                    'Data Devolução': unit.dueDate === 'Indefinido' ? 'Indefinido' : new Date(unit.dueDate).toLocaleDateString('pt-BR')
                                });
                            } else { // Atribuído
                                const fleet = fleets.find(f => f.chassi === unit.assignedTo);
                                assignmentsData.push({
                                    'ID do Item': item.id,
                                    'Nome do Item': item.name,
                                    'Classe': item.class || '',
                                    'Unidade': unit.unitId,
                                    'Nº de Série': unit.identifier || '',
                                    'Atribuído a Frota': fleet ? fleet.name : unit.assignedTo,
                                    'Chassi da Frota': unit.assignedTo
                                });
                            }
                        }
                    });
                }
            } else {
                statusOrQty = item.quantity;
            }

            mainData.push({
                'ID': item.id,
                'Nome': item.name,
                'Tipo': item.type,
                'Classe (se aplicável)': item.class || '',
                'Status/Qtd': statusOrQty,
                'Última Alteração Por': lastChange ? lastChange.user : '',
                'Data/Hora': lastChange ? new Date(lastChange.timestamp).toLocaleString('pt-BR') : ''
            });
        });

        const wb = XLSX.utils.book_new();
        const wsMain = XLSX.utils.json_to_sheet(mainData);
        XLSX.utils.book_append_sheet(wb, wsMain, "Inventário Geral");

        if (loansData.length > 0) {
            const wsLoans = XLSX.utils.json_to_sheet(loansData);
            XLSX.utils.book_append_sheet(wb, wsLoans, "Empréstimos Ativos");
        }
        if (assignmentsData.length > 0) {
            const wsAssignments = XLSX.utils.json_to_sheet(assignmentsData);
            XLSX.utils.book_append_sheet(wb, wsAssignments, "Atribuições Ativas");
        }
        
        XLSX.writeFile(wb, "inventario_detalhado.xlsx");
    });
    
    exportLogBtn.addEventListener('click', () => {
        const allLogs = [];
        inventoryItems.forEach(item => {
            if (item.history) {
                item.history.forEach(log => {
                    allLogs.push({
                        'ID do Item': item.id,
                        'Nome do Item': item.name,
                        'Data/Hora': new Date(log.timestamp).toLocaleString('pt-BR'),
                        'Usuário': log.user,
                        'Ação': log.action,
                        'Detalhes': log.details
                    });
                });
            }
        });

        if (allLogs.length === 0) {
            alert('Nenhum registro no log para exportar.');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(allLogs);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Log Completo");
        XLSX.writeFile(workbook, "log_completo_inventario.xlsx");
    });

    // --- Lógica de Notificações ---
    const updateNotifications = () => {
        const overdueLoans = [];
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas o dia

        inventoryItems.forEach(item => {
            if (item.type === 'ferramenta' && item.units) {
                item.units.forEach(unit => {
                    if (unit.status === 'emprestada' && unit.dueDate && unit.dueDate !== 'Indefinido') {
                        const dueDate = new Date(unit.dueDate);
                        if (now > dueDate) {
                            const diffTime = Math.abs(now - dueDate);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            overdueLoans.push({
                                itemName: item.name,
                                unitId: unit.unitId,
                                lentTo: unit.lentTo,
                                daysOverdue: diffDays
                            });
                        }
                    }
                });
            }
        });

        if (overdueLoans.length > 0) {
            notificationBadge.textContent = overdueLoans.length;
            notificationBadge.classList.remove('hidden');
        } else {
            notificationBadge.classList.add('hidden');
        }
        
        notificationsBtn.onclick = () => openNotificationsModal(overdueLoans);
    };

    closeNotificationsBtn.addEventListener('click', closeNotificationsModal);

    window.handleExtendLoan = async (itemId, unitId) => {
        const newDate = prompt("Digite a nova data de devolução (AAAA-MM-DD):");
        if (newDate) {
            const item = inventoryItems.find(i => i.docId === itemId);
            const unit = item.units.find(u => u.unitId === unitId);
            
            unit.dueDate = newDate;
            
            addHistoryRecord(item, 'Prorrogação', `Empréstimo da Unidade ${unitId} prorrogado para ${new Date(newDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}.`);
            
            const itemRef = doc(db, "inventory", itemId);
            await updateDoc(itemRef, {
                units: item.units,
                history: item.history
            });
            openUnitManagementModal(item);
        }
    };
    
    // --- Lógica de Frotas ---
    manageFleetsBtn.addEventListener('click', () => {
        renderFleetList();
        fleetManagementModal.classList.remove('hidden');
    });
    closeFleetManagementBtn.addEventListener('click', () => fleetManagementModal.classList.add('hidden'));

    fleetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const originalChassi = document.getElementById('originalChassi').value;
        const fleetData = {
            name: document.getElementById('fleetName').value,
            model: document.getElementById('fleetModel').value,
            chassi: document.getElementById('fleetChassi').value
        };

        if (originalChassi) { // Editando
            const fleetRef = doc(db, "fleets", originalChassi);
            await setDoc(fleetRef, fleetData);
        } else { // Adicionando
            const fleetRef = doc(db, "fleets", fleetData.chassi);
            const docSnap = await getDoc(fleetRef);
            if (docSnap.exists()) {
                alert("Erro: Já existe uma frota com este Chassi.");
                return;
            }
            await setDoc(fleetRef, fleetData);
        }
        fleetForm.reset();
        document.getElementById('originalChassi').value = '';
    });

    const renderFleetList = async () => {
        fleetList.innerHTML = '';
        const fleetsSnapshot = await getDocs(collection(db, "fleets"));
        fleets = [];
        fleetsSnapshot.forEach(doc => fleets.push({ id: doc.id, ...doc.data()}));

        fleets.forEach(fleet => {
            const fleetDiv = document.createElement('div');
            fleetDiv.className = 'flex justify-between items-center p-2 border rounded-md';
            fleetDiv.innerHTML = `
                <div>
                    <p class="font-semibold">${fleet.name} (${fleet.model})</p>
                    <p class="text-sm text-gray-500">Chassi: ${fleet.chassi}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="handleViewFleetItems('${fleet.id}')" class="text-green-500 hover:text-green-700 text-sm" title="Ver Itens Atribuídos"><i class="fas fa-eye"></i></button>
                    <button onclick="handleEditFleet('${fleet.id}')" class="text-blue-500 hover:text-blue-700 text-sm" title="Editar Frota"><i class="fas fa-edit"></i></button>
                    <button onclick="handleDeleteFleet('${fleet.id}')" class="text-red-500 hover:text-red-700 text-sm" title="Excluir Frota"><i class="fas fa-trash"></i></button>
                </div>
            `;
            fleetList.appendChild(fleetDiv);
        });
    };

    window.handleEditFleet = (chassi) => {
        const fleet = fleets.find(f => f.id === chassi);
        if (fleet) {
            document.getElementById('originalChassi').value = fleet.id;
            document.getElementById('fleetName').value = fleet.name;
            document.getElementById('fleetModel').value = fleet.model;
            document.getElementById('fleetChassi').value = fleet.chassi;
        }
    };
    
    window.handleDeleteFleet = async (chassi) => {
        if (confirm(`Tem certeza que deseja excluir a frota com chassi ${chassi}?`)) {
            await deleteDoc(doc(db, "fleets", chassi));
        }
    };

    window.handleViewFleetItems = (chassi) => {
        const fleet = fleets.find(f => f.id === chassi);
        fleetItemsName.textContent = `${fleet.name} (${fleet.model})`;
        fleetItemsList.innerHTML = '';
        
        const assignedItems = inventoryItems.filter(item => 
            item.type === 'atribuido' &&
            item.units.some(unit => unit.assignedTo === chassi)
        );

        if (assignedItems.length === 0) {
            fleetItemsList.innerHTML = '<p class="text-gray-500 text-center">Nenhum item atribuído a esta frota.</p>';
        } else {
            assignedItems.forEach(item => {
                item.units.forEach(unit => {
                    if (unit.assignedTo === chassi) {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'p-2 border-b';
                        itemDiv.innerHTML = `
                            <p class="font-semibold">${item.name} (Unidade ${unit.unitId})</p>
                            <p class="text-sm text-gray-600">Nº de Série: ${unit.identifier || 'Não informado'}</p>
                        `;
                        fleetItemsList.appendChild(itemDiv);
                    }
                });
            });
        }
        fleetItemsModal.classList.remove('hidden');
    };
    closeFleetItemsBtn.addEventListener('click', () => fleetItemsModal.classList.add('hidden'));

    // --- Inicialização ---
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            showLogin();
        }
    });
});
