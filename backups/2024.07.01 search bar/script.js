let highestZIndex = 1;
let currentWallpaper = null;
let currentFlooring = null;
let currentBackground = null;

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text/plain", event.target.id);

    const views = JSON.parse(event.target.dataset.views);
    const filepath = event.target.dataset.filepath;
    let currentViewIndex = event.target.dataset.currentViewIndex ? parseInt(event.target.dataset.currentViewIndex) : 0;
    const dragImage = document.createElement('img');
    dragImage.src = filepath + views[currentViewIndex];
    dragImage.style.opacity = '0.75'; // Set the opacity to a uniform lower value
    dragImage.style.position = 'absolute';
    dragImage.style.left = '-99999px';
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, event.offsetX, event.offsetY);

    setTimeout(() => {
        document.body.removeChild(dragImage);
    }, 0);
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    const dropZone = document.getElementById('dropZone');

    if (!draggedElement) return;

    const dropRect = dropZone.getBoundingClientRect();
    const x = event.clientX - dropRect.left - draggedElement.width / 2;
    const y = event.clientY - dropRect.top - draggedElement.height / 2;

    if (event.shiftKey) {
        const clonedElement = createClonedElement(draggedElement, x, y);
        dropZone.appendChild(clonedElement);
    } else if (draggedElement.dataset.source === 'catalog') {
        const views = JSON.parse(draggedElement.dataset.views);
        const filepath = draggedElement.dataset.filepath;
        const clonedElement = document.createElement('img');
        clonedElement.src = filepath + views[0];
        clonedElement.alt = draggedElement.alt;
        clonedElement.style.position = 'absolute';
        clonedElement.style.left = `${x}px`;
        clonedElement.style.top = `${y}px`;
        clonedElement.setAttribute('tabindex', '0');
        clonedElement.id = `cloned-${data}-${Date.now()}`;
        clonedElement.dataset.views = JSON.stringify(views);
        clonedElement.dataset.currentViewIndex = "0";
        clonedElement.dataset.filepath = filepath;

        clonedElement.style.zIndex = ++highestZIndex;
        clonedElement.draggable = true;
        clonedElement.dataset.source = 'dropZone';

        clonedElement.addEventListener('dragstart', drag);
        clonedElement.addEventListener('keydown', function(event) {
            handleArrowKeys(event, clonedElement);
        });
        clonedElement.addEventListener('click', function() {
            bringToFront(clonedElement);
        });
        clonedElement.addEventListener('dblclick', function() {
            changeView(clonedElement);
        });

        dropZone.appendChild(clonedElement);
    } else {
        draggedElement.style.left = `${x}px`;
        draggedElement.style.top = `${y}px`;

        draggedElement.style.zIndex = ++highestZIndex;
    }
}

function createClonedElement(draggedElement, x, y) {
    const views = JSON.parse(draggedElement.dataset.views);
    const filepath = draggedElement.dataset.filepath;
    const currentViewIndex = parseInt(draggedElement.dataset.currentViewIndex);
    const clonedElement = document.createElement('img');
    clonedElement.src = filepath + views[currentViewIndex];
    clonedElement.alt = draggedElement.alt;
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = `${x}px`;
    clonedElement.style.top = `${y}px`;
    clonedElement.setAttribute('tabindex', '0');
    clonedElement.id = `cloned-${draggedElement.id}-${Date.now()}`;
    clonedElement.dataset.views = JSON.stringify(views);
    clonedElement.dataset.currentViewIndex = currentViewIndex.toString();
    clonedElement.dataset.filepath = filepath;

    clonedElement.style.zIndex = ++highestZIndex;
    clonedElement.draggable = true;
    clonedElement.dataset.source = 'dropZone';

    clonedElement.addEventListener('dragstart', drag);
    clonedElement.addEventListener('keydown', function(event) {
        handleArrowKeys(event, clonedElement);
    });
    clonedElement.addEventListener('click', function() {
        bringToFront(clonedElement);
    });
    clonedElement.addEventListener('dblclick', function() {
        changeView(clonedElement);
    });

    return clonedElement;
}

function handleArrowKeys(event, element) {
    const step = 5;
    event.preventDefault();
    switch(event.key) {
        case 'ArrowLeft':
            element.style.left = `${parseInt(element.style.left) - step}px`;
            break;
        case 'ArrowRight':
            element.style.left = `${parseInt(element.style.left) + step}px`;
            break;
        case 'ArrowUp':
            element.style.top = `${parseInt(element.style.top) - step}px`;
            break;
        case 'ArrowDown':
            element.style.top = `${parseInt(element.style.top) + step}px`;
            break;
        case 'Backspace':
            element.remove();
            event.preventDefault();
            break;
    }
}

function bringToFront(element) {
    element.style.zIndex = ++highestZIndex;
}

function setBackground(item) {
    const dropZone = document.getElementById('dropZone');
    const { dropImage, fixedLocation } = item.dataset;
    const imgElement = item.dataset.name.includes('Wallpaper') ? document.getElementById('wallpaper') :
                        item.dataset.name.includes('Flooring') ? document.getElementById('flooring') : 
                        document.getElementById('background');
    
    if (item.dataset.name.includes('Wallpaper') && currentWallpaper) {
        currentWallpaper.src = '';
    } else if (item.dataset.name.includes('Flooring') && currentFlooring) {
        currentFlooring.src = '';
    } else if (item.dataset.name.includes('Background') && currentBackground) {
        currentBackground.src = '';
    }

    imgElement.src = dropImage;
    const location = JSON.parse(fixedLocation);
    imgElement.style.left = location.left;
    imgElement.style.top = location.top;

    if (item.dataset.name.includes('Wallpaper')) {
        currentWallpaper = imgElement;
    } else if (item.dataset.name.includes('Flooring')) {
        currentFlooring = imgElement;
    } else if (item.dataset.name.includes('Background')) {
        currentBackground = imgElement;
    }
}

function toggleButtonActive(button) {
    button.classList.toggle('active');
}

document.getElementById('toggleGridWallpaper').addEventListener('click', (event) => {
    const gridWallpaper = document.getElementById('gridWallpaper');
    gridWallpaper.style.display = gridWallpaper.style.display === 'block' ? 'none' : 'block';
    toggleButtonActive(event.target);
});

document.getElementById('toggleGridFlooring').addEventListener('click', (event) => {
    const gridFlooring = document.getElementById('gridFlooring');
    gridFlooring.style.display = gridFlooring.style.display === 'block' ? 'none' : 'block';
    toggleButtonActive(event.target);
});

function openLeftTab(event, tabName) {
    const tabcontent = document.querySelectorAll('#leftCatalogContainer .tabcontent');
    tabcontent.forEach(content => content.style.display = 'none');

    const tablinks = document.querySelectorAll('#leftCatalogContainer .tablinks');
    tablinks.forEach(link => link.classList.remove('active'));

    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.classList.add('active');

    filterItems('All'); // Reset the filter when clicking the All Items tab
}

function openRightTab(event, tabName) {
    const tabcontent = document.querySelectorAll('#rightCatalogContainer .tabcontent');
    tabcontent.forEach(content => content.style.display = 'none');

    const tablinks = document.querySelectorAll('#rightCatalogContainer .tablinks');
    tablinks.forEach(link => link.classList.remove('active'));

    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.classList.add('active');
}

function filterItems(category) {
    const items = document.querySelectorAll('#AllItems .catalog-item');
    items.forEach(item => {
        if (category === 'All' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });

    // Update the active state of the filter buttons
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.classList.remove('active');
        if (button.textContent === category) {
            button.classList.add('active');
        }
    });

    searchItems(); // Apply search filter if any search term is present
}

function changeView(element) {
    const views = JSON.parse(element.dataset.views);
    const filepath = element.dataset.filepath;
    let currentViewIndex = parseInt(element.dataset.currentViewIndex);
    currentViewIndex = (currentViewIndex + 1) % views.length;
    element.src = filepath + views[currentViewIndex];
    element.dataset.currentViewIndex = currentViewIndex;
}

function searchItems() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('#AllItems .catalog-item');
    items.forEach(item => {
        const itemName = item.querySelector('p') ? item.querySelector('p').textContent.toLowerCase() : '';
        const itemCategory = item.dataset.category ? item.dataset.category.toLowerCase() : '';
        const filterCategory = document.querySelector('.filter-button.active') ? document.querySelector('.filter-button.active').textContent.toLowerCase() : 'all items';
        
        if (itemName.includes(searchTerm) && (filterCategory === 'all items' || itemCategory === filterCategory)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Load JSON data and create catalog items for the left catalog
fetch('catalog.json')
    .then(response => response.json())
    .then(data => {
        const allTab = document.getElementById('AllItems');

        data.forEach(item => {
            const itemContainer = document.createElement('div');
            itemContainer.className = 'catalog-item';
            itemContainer.dataset.category = item.category;

            const img = document.createElement('img');
            img.id = item.name;
            img.src = item.filepath + item.catalogImage;
            img.alt = item.name;
            img.draggable = true;
            img.dataset.dropImage = item.filepath + item.views[0];
            img.dataset.views = JSON.stringify(item.views);
            img.dataset.filepath = item.filepath;
            img.dataset.source = 'catalog';
            img.ondragstart = drag;

            const name = document.createElement('p');
            name.textContent = item.name;

            itemContainer.appendChild(img);
            itemContainer.appendChild(name);

            allTab.appendChild(itemContainer);
        });

        document.querySelector('#leftCatalogContainer .tab button').click();
    })
    .catch(error => console.error('Error fetching JSON:', error));

// Load JSON data and create background catalog items for the right catalog
fetch('backgrounds.json')
    .then(response => response.json())
    .then(data => {
        const flooringTab = document.getElementById('Flooring');
        const wallpaperTab = document.getElementById('Wallpaper');
        const backgroundTab = document.getElementById('Background');
        let defaultWallpaper = null;
        let defaultFlooring = null;
        let defaultBackground = null;

        data.forEach(item => {
            const itemContainer = document.createElement('div');
            itemContainer.className = 'catalog-item';

            const img = document.createElement('img');
            img.id = item.name;
            img.src = item.filepath + item.catalogImage;
            img.alt = item.name;
            img.dataset.dropImage = item.filepath + item.dropImage;
            img.dataset.fixedLocation = JSON.stringify(item.fixedLocation);
            img.dataset.name = item.name;
            img.onclick = () => setBackground(img);

            const name = document.createElement('p');
            name.textContent = item.name;

            itemContainer.appendChild(img);
            itemContainer.appendChild(name);

            if (item.filepath.includes('flooring')) {
                flooringTab.appendChild(itemContainer);
            } else if (item.filepath.includes('wallpaper')) {
                wallpaperTab.appendChild(itemContainer);
            } else if (item.filepath.includes('backgrounds')) {
                backgroundTab.appendChild(itemContainer);
            }

            if (item.name === 'Default Wallpaper') {
                defaultWallpaper = img;
            } else if (item.name === 'Default Flooring') {
                defaultFlooring = img;
            } else if (item.name === 'Default Background') {
                defaultBackground = img;
            }
        });

        if (defaultWallpaper) {
            setBackground(defaultWallpaper);
        }
        if (defaultFlooring) {
            setBackground(defaultFlooring);
        }
        if (defaultBackground) {
            setBackground(defaultBackground);
        }

        document.querySelector('#rightCatalogContainer .tab button').click();
    })
    .catch(error => console.error('Error fetching JSON:', error));

