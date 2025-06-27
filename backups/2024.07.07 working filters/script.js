let highestZIndex = 1;
let currentWallpaper = null;
let currentFlooring = null;
let currentBackground = null;
let offsetX, offsetY;

let activeCollections = new Set();
let activeColors = new Set();
let collections = new Set();
let colors = new Set();

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

    offsetX = event.offsetX;
    offsetY = event.offsetY;

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
    const x = event.clientX - dropRect.left - offsetX;
    const y = event.clientY - dropRect.top - offsetY;

    if (event.shiftKey) {
        const clonedElement = createClonedElement(draggedElement, x, y);
        dropZone.appendChild(clonedElement);
    } else if (draggedElement.dataset.source === 'catalog') {
        const views = JSON.parse(draggedElement.dataset.views);
        const filepath = draggedElement.dataset.filepath;
        const clonedElement = document.createElement('img');
        clonedElement.src = filepath + views[0]; // Use the first view
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

document.getElementById('checkboxGridWallpaper').addEventListener('change', (event) => {
    const gridWallpaper = document.getElementById('gridWallpaper');
    gridWallpaper.style.display = event.target.checked ? 'block' : 'none';
});

document.getElementById('checkboxGridFlooring').addEventListener('change', (event) => {
    const gridFlooring = document.getElementById('gridFlooring');
    gridFlooring.style.display = event.target.checked ? 'block' : 'none';
});

function openLeftTab(event, tabName) {
    const tabcontent = document.querySelectorAll('#leftCatalogContainer .tabcontent');
    tabcontent.forEach(content => content.style.display = 'none');

    const tablinks = document.querySelectorAll('#leftCatalogContainer .tablinks');
    tablinks.forEach(link => link.classList.remove('active'));

    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.classList.add('active');

    filterItems(); // Reset the filter when clicking the All Items tab
}

function openRightTab(event, tabName) {
    const tabcontent = document.querySelectorAll('#rightCatalogContainer .tabcontent');
    tabcontent.forEach(content => content.style.display = 'none');

    const tablinks = document.querySelectorAll('#rightCatalogContainer .tablinks');
    tablinks.forEach(link => link.classList.remove('active'));

    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.classList.add('active');
}

function filterItems() {
    const items = document.querySelectorAll('#AllItems .catalog-item');
    items.forEach(item => {
        const itemColors = item.dataset.colors ? JSON.parse(item.dataset.colors) : [];
        const itemCollections = item.dataset.collection ? item.dataset.collection.split(',') : [];

        const matchesCollection = activeCollections.size === 0 || itemCollections.some(collection => activeCollections.has(collection.toLowerCase()));
        const matchesColor = activeColors.size === 0 || itemColors.some(color => activeColors.has(color.toLowerCase()));

        if (matchesCollection && matchesColor) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });

    searchItemsLeft(); // Apply search filter if any search term is present
}

function changeView(element) {
    const views = JSON.parse(element.dataset.views);
    const filepath = element.dataset.filepath;
    let currentViewIndex = parseInt(element.dataset.currentViewIndex);
    currentViewIndex = (currentViewIndex + 1) % views.length;
    element.src = filepath + views[currentViewIndex];
    element.dataset.currentViewIndex = currentViewIndex;
}
function searchItemsLeft() {
    const searchTerm = document.getElementById('searchInputLeft').value.toLowerCase();
    const items = document.querySelectorAll('#AllItems .catalog-item');
    items.forEach(item => {
        const itemName = item.querySelector('p') ? item.querySelector('p').textContent.toLowerCase() : '';
        const itemCollection = item.dataset.collection ? item.dataset.collection.toLowerCase().split(',') : [];
        const itemColors = item.dataset.colors ? JSON.parse(item.dataset.colors).map(color => color.toLowerCase()) : [];

        const matchesCollection = activeCollections.size === 0 || itemCollection.some(collection => activeCollections.has(collection));
        const matchesColor = activeColors.size === 0 || itemColors.some(color => activeColors.has(color));

        if (itemName.includes(searchTerm) && matchesCollection && matchesColor) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function searchItemsRight() {
    const searchTerm = document.getElementById('searchInputRight').value.toLowerCase();
    const activeTab = document.querySelector('#rightCatalogContainer .tabcontent[style*="block"]');
    if (!activeTab) return;

    const items = activeTab.querySelectorAll('.catalog-item');
    items.forEach(item => {
        const itemName = item.querySelector('p') ? item.querySelector('p').textContent.toLowerCase() : '';

        if (itemName.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function toggleCollectionsPopup() {
    const popup = document.getElementById('collectionsPopup');
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
}

function toggleColorsPopup() {
    const popup = document.getElementById('colorsPopup');
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
}

function setActiveCollection(collection, isActive) {
    if (isActive) {
        activeCollections.add(collection.toLowerCase());
    } else {
        activeCollections.delete(collection.toLowerCase());
    }

    document.getElementById('collectionsButton').textContent = `Collections: ${[...activeCollections].join(', ')}`;
    filterItems();
}

function setActiveColor(color, isActive) {
    if (isActive) {
        activeColors.add(color.toLowerCase());
    } else {
        activeColors.delete(color.toLowerCase());
    }

    document.getElementById('colorsButton').textContent = `Colors: ${[...activeColors].join(', ')}`;
    filterItems();
}

function loadCollections(collections) {
    const collectionButtonsContainer = document.getElementById('collectionButtons');
    collectionButtonsContainer.innerHTML = '';

    // Sort collections alphabetically
    const sortedCollections = Array.from(collections).sort();

    sortedCollections.forEach(collection => {
        const button = document.createElement('label');
        button.className = 'collection-button';
        button.innerHTML = `<input type="checkbox" value="${collection}" onclick="setActiveCollection('${collection}', this.checked)"> ${collection}`;
        collectionButtonsContainer.appendChild(button);
    });
}

function loadColors(colors) {
    const colorButtonsContainer = document.getElementById('colorButtons');
    colorButtonsContainer.innerHTML = '';

    // Sort colors alphabetically
    const sortedColors = Array.from(colors).sort();

    sortedColors.forEach(color => {
        const button = document.createElement('label');
        button.className = 'color-button';
        button.innerHTML = `<input type="checkbox" value="${color}" onclick="setActiveColor('${color}', this.checked)"> ${color}`;
        colorButtonsContainer.appendChild(button);
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
            itemContainer.dataset.collection = item.collection ? item.collection.toLowerCase() : '';
            itemContainer.dataset.colors = JSON.stringify(item.colors ? item.colors.map(color => color.toLowerCase()) : []);

            collections.add(item.collection ? item.collection.toLowerCase() : '');
            (item.colors || []).forEach(color => colors.add(color.toLowerCase()));

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

        loadCollections([...collections]);
        loadColors([...colors]);

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


