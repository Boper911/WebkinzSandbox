let highestZIndex = 0;
let offsetX = 0;
let offsetY = 0;
let activeCollections = new Set();
let activeColors = new Set();
let activeCategories = new Set();
let activeFootprints = new Set();
let collections = new Set();
let colors = new Set();
let categories = new Set();
let footprints = new Set();
let currentWallpaper = null;
let currentFlooring = null;
let currentBackground = null;
let activeCategoriesWallpaperFlooring = new Set();
let activeCollectionsWallpaperFlooring = new Set();
let activeColorsWallpaperFlooring = new Set();
let categoriesWallpaperFlooring = new Set();
let collectionsWallpaperFlooring = new Set();
let colorsWallpaperFlooring = new Set();

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#leftTabs .tablinks').click();

    fetch('wallfloor.json')
        .then(response => response.json())
        .then(data => {
            const defaultWallpaper = data.find(item => item.name === 'Default Wallpaper');
            const defaultFlooring = data.find(item => item.name === 'Default Flooring');

            if (defaultWallpaper) {
                setDefaultItem(defaultWallpaper);
            }

            if (defaultFlooring) {
                setDefaultItem(defaultFlooring);
            }

            loadWallpaperFlooring();
            adjustCatalogHeight();
        })
        .catch(error => console.error('Error fetching JSON:', error));

    fetch('backgrounds.json')
        .then(response => response.json())
        .then(data => {
            const defaultBackground = data.find(item => item.name === 'Default Background');
            if (defaultBackground) {
                setDefaultBackground(defaultBackground);
            }

            loadBackgrounds();
            adjustCatalogHeight();
        })
        .catch(error => console.error('Error fetching JSON:', error));
        
    fetch('catalog.json')
        .then(response => response.json())
        .then(data => {
            loadItems(data);
            adjustCatalogHeight();
        })
        .catch(error => console.error('Error fetching JSON:', error));

    window.addEventListener('resize', adjustCatalogHeight);
    document.querySelectorAll('.dropdown-button').forEach(button => {
        button.addEventListener('click', adjustCatalogHeight);
    });
});

function openLeftTab(evt, tabName) {
    const tabContents = document.getElementsByClassName('leftTabContent');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = 'none';
    }

    const tabLinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(' active', '');
    }

    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
    adjustCatalogHeight();
}

function adjustCatalogHeight() {
    const catalogs = ['#AllItems', '#AllWallpaperFlooring', '#AllBackgrounds'];
    const dropZoneHeight = 1500;
    const searchBarHeight = 50;

    catalogs.forEach(catalogSelector => {
        const catalog = document.querySelector(catalogSelector);
        const searchInput = catalog.previousElementSibling.querySelector('input');
        const filtersContainer = catalog.previousElementSibling.querySelector('.filtersContainer');

        let totalHeight = dropZoneHeight - searchBarHeight;

        if (filtersContainer) {
            totalHeight -= filtersContainer.offsetHeight;
        }

        catalog.style.maxHeight = `${totalHeight}px`;
    });
}

function setDefaultItem(item) {
    const imgElement = document.createElement('img');
    imgElement.src = 'images/wallfloor/' + item.views[2]; // Use the "large" view
    imgElement.style.left = item.fixedLocationLeft;
    imgElement.style.top = item.fixedLocationTop;
    imgElement.style.position = 'absolute';
    imgElement.classList.add('background');

    imgElement.dataset.category = item.category;
    imgElement.dataset.dropImage = 'images/wallfloor/' + item.views[2];
    imgElement.dataset.fixedLocationLeft = item.fixedLocationLeft;
    imgElement.dataset.fixedLocationTop = item.fixedLocationTop;
    
    if (item.category.toLowerCase() === 'wallpaper') {
        imgElement.id = 'wallpaper';
        currentWallpaper = imgElement;
    } else if (item.category.toLowerCase() === 'flooring') {
        imgElement.id = 'flooring';
        currentFlooring = imgElement;
    }

    document.getElementById('dropZone').appendChild(imgElement);
}

function setDefaultBackground(item) {
    const imgElement = document.getElementById('background');
    imgElement.src = 'images/backgrounds/' + item.dropImage;
    imgElement.style.left = '0px';
    imgElement.style.top = '0px';
    currentBackground = imgElement;
}

function toggleDropdown(dropdownId) {
    const dropdowns = document.querySelectorAll('.dropdown-content');
    dropdowns.forEach(dropdown => {
        if (dropdown.id !== dropdownId) {
            dropdown.style.display = 'none';
        }
    });
    
    const dropdown = document.getElementById(dropdownId);
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    adjustCatalogHeight(); // Adjust height after toggling dropdown
}

function resetAllFilters() {
    activeCollections.clear();
    activeColors.clear();
    activeCategories.clear();
    activeFootprints.clear();
    document.getElementById('collectionsButton').textContent = 'Collections';
    document.getElementById('colorsButton').textContent = 'Colors';
    document.getElementById('categoriesButton').textContent = 'Category';
    document.getElementById('footprintButton').textContent = 'Footprint';
    
    // Uncheck all checkboxes in the dropdowns
    const checkboxes = document.querySelectorAll('.dropdown-content input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
    
    // Close all dropdowns
    const dropdowns = document.querySelectorAll('.dropdown-content');
    dropdowns.forEach(dropdown => dropdown.style.display = 'none');
    
    filterItems(); // Reapply filter
}

function loadCollections(collections) {
    const collectionButtonsContainer = document.getElementById('collectionsDropdown');
    collectionButtonsContainer.innerHTML = '';

    // Sort collections alphabetically
    const sortedCollections = Array.from(collections).sort();

    sortedCollections.forEach(collection => {
        if (collection.trim() === '') return;
        const button = document.createElement('label');
        button.className = 'collection-button';
        button.innerHTML = `<input type="checkbox" value="${collection}" onclick="setActiveCollection('${collection}', this.checked)"> ${collection}`;
        collectionButtonsContainer.appendChild(button);
    });
}

function loadColors(colors) {
    const colorButtonsContainer = document.getElementById('colorsDropdown');
    colorButtonsContainer.innerHTML = '';

    // Sort colors alphabetically
    const sortedColors = Array.from(colors).sort();

    sortedColors.forEach(color => {
        if (color.trim() === '') return;
        const button = document.createElement('label');
        button.className = 'color-button';
        button.innerHTML = `<input type="checkbox" value="${color}" onclick="setActiveColor('${color}', this.checked)"> ${color}`;
        colorButtonsContainer.appendChild(button);
    });
}

function loadCategories(categories) {
    const categoryButtonsContainer = document.getElementById('categoriesDropdown');
    categoryButtonsContainer.innerHTML = '';

    // Sort categories alphabetically
    const sortedCategories = Array.from(categories).sort();

    sortedCategories.forEach(category => {
        if (category.trim() === '') return;
        const button = document.createElement('label');
        button.className = 'category-button';
        button.innerHTML = `<input type="checkbox" value="${category}" onclick="setActiveCategory('${category}', this.checked)"> ${category}`;
        categoryButtonsContainer.appendChild(button);
    });
}

function loadFootprints(footprints) {
    const footprintButtonsContainer = document.getElementById('footprintDropdown');
    footprintButtonsContainer.innerHTML = '';

    // Sort footprints alphabetically
    const sortedFootprints = Array.from(footprints).sort();

    sortedFootprints.forEach(footprint => {
        if (footprint.trim() === '') return;
        const button = document.createElement('label');
        button.className = 'footprint-button';
        button.innerHTML = `<input type="checkbox" value="${footprint}" onclick="setActiveFootprint('${footprint}', this.checked)"> ${footprint}`;
        footprintButtonsContainer.appendChild(button);
    });
}

function filterItems() {
    const items = document.querySelectorAll('#AllItems .catalog-item');
    items.forEach(item => {
        const itemColors = item.dataset.colors ? JSON.parse(item.dataset.colors) : [];
        const itemCollections = item.dataset.collection ? item.dataset.collection.split(',') : [];
        const itemCategory = item.dataset.category ? item.dataset.category.toLowerCase() : '';
        const itemFootprint = item.dataset.footprint ? item.dataset.footprint.toLowerCase() : '';

        const matchesCollection = activeCollections.size === 0 || itemCollections.some(collection => activeCollections.has(collection.toLowerCase()));
        const matchesColor = activeColors.size === 0 || itemColors.some(color => activeColors.has(color.toLowerCase()));
        const matchesCategory = activeCategories.size === 0 || activeCategories.has(itemCategory);
        const matchesFootprint = activeFootprints.size === 0 || activeFootprints.has(itemFootprint);

        if (matchesCollection && matchesColor && matchesCategory && matchesFootprint) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });

    searchItemsLeft(); // Apply search filter if any search term is present
}

function searchItemsLeft() {
    const searchTerm = document.getElementById('searchInputLeft').value.toLowerCase();
    const items = document.querySelectorAll('#AllItems .catalog-item');
    items.forEach(item => {
        const itemName = item.querySelector('p') ? item.querySelector('p').textContent.toLowerCase() : '';
        const itemCollection = item.dataset.collection ? item.dataset.collection.toLowerCase().split(',') : [];
        const itemColors = item.dataset.colors ? JSON.parse(item.dataset.colors).map(color => color.toLowerCase()) : [];
        const itemCategory = item.dataset.category ? item.dataset.category.toLowerCase() : '';
        const itemFootprint = item.dataset.footprint ? item.dataset.footprint.toLowerCase() : '';

        const matchesCollection = activeCollections.size === 0 || itemCollection.some(collection => activeCollections.has(collection));
        const matchesColor = activeColors.size === 0 || itemColors.some(color => activeColors.has(color));
        const matchesCategory = activeCategories.size === 0 || activeCategories.has(itemCategory);
        const matchesFootprint = activeFootprints.size === 0 || activeFootprints.has(itemFootprint);

        if (itemName.includes(searchTerm) && matchesCollection && matchesColor && matchesCategory && matchesFootprint) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function setActiveCategory(category, isActive) {
    if (isActive) {
        activeCategories.add(category.toLowerCase());
    } else {
        activeCategories.delete(category.toLowerCase());
    }

    // Update button text
    const categoryButton = document.getElementById('categoriesButton');
    if (activeCategories.size === 0) {
        categoryButton.textContent = 'Category';
    } else {
        categoryButton.textContent = `Category: ${[...activeCategories].join(', ')}`;
    }

    filterItems();
}

function setActiveCollection(collection, isActive) {
    if (isActive) {
        activeCollections.add(collection.toLowerCase());
    } else {
        activeCollections.delete(collection.toLowerCase());
    }

    // Update button text
    const collectionButton = document.getElementById('collectionsButton');
    if (activeCollections.size === 0) {
        collectionButton.textContent = 'Collections';
    } else {
        collectionButton.textContent = `Collections: ${[...activeCollections].join(', ')}`;
    }

    filterItems();
}

function setActiveColor(color, isActive) {
    if (isActive) {
        activeColors.add(color.toLowerCase());
    } else {
        activeColors.delete(color.toLowerCase());
    }

    // Update button text
    const colorButton = document.getElementById('colorsButton');
    if (activeColors.size === 0) {
        colorButton.textContent = 'Colors';
    } else {
        colorButton.textContent = `Colors: ${[...activeColors].join(', ')}`;
    }

    filterItems();
}

function setActiveFootprint(footprint, isActive) {
    if (isActive) {
        activeFootprints.add(footprint.toLowerCase());
    } else {
        activeFootprints.delete(footprint.toLowerCase());
    }

    // Update button text
    const footprintButton = document.getElementById('footprintButton');
    if (activeFootprints.size === 0) {
        footprintButton.textContent = 'Footprint';
    } else {
        footprintButton.textContent = `Footprint: ${[...activeFootprints].join(', ')}`;
    }

    filterItems();
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text/plain", event.target.id);

    const views = JSON.parse(event.target.dataset.views);
    let currentViewIndex = event.target.dataset.currentViewIndex ? parseInt(event.target.dataset.currentViewIndex) : 0;
    const dragImage = document.createElement('img');
    dragImage.src = views[currentViewIndex];
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
        const clonedElement = document.createElement('img');
        clonedElement.src = views[0]; // Use the first view
        clonedElement.alt = draggedElement.alt;
        clonedElement.style.position = 'absolute';
        clonedElement.style.left = `${x}px`;
        clonedElement.style.top = `${y}px`;
        clonedElement.setAttribute('tabindex', '0');
        clonedElement.id = `cloned-${data}-${Date.now()}`;
        clonedElement.dataset.views = JSON.stringify(views);
        clonedElement.dataset.currentViewIndex = "0";
        clonedElement.dataset.source = 'dropZone';

        clonedElement.style.zIndex = ++highestZIndex;
        clonedElement.draggable = true;

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
    const currentViewIndex = parseInt(draggedElement.dataset.currentViewIndex);
    const clonedElement = document.createElement('img');
    clonedElement.src = views[currentViewIndex];
    clonedElement.alt = draggedElement.alt;
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = `${x}px`;
    clonedElement.style.top = `${y}px`;
    clonedElement.setAttribute('tabindex', '0');
    clonedElement.id = `cloned-${draggedElement.id}-${Date.now()}`;
    clonedElement.dataset.views = JSON.stringify(views);
    clonedElement.dataset.currentViewIndex = currentViewIndex.toString();

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

function changeView(element) {
    const views = JSON.parse(element.dataset.views);
    let currentViewIndex = parseInt(element.dataset.currentViewIndex);
    currentViewIndex = (currentViewIndex + 1) % views.length;
    element.src = views[currentViewIndex];
    element.dataset.currentViewIndex = currentViewIndex;
}

function setBackground(item) {
    const dropZone = document.getElementById('dropZone');
    const category = item.dataset.category ? item.dataset.category.toLowerCase() : null;
    let imgElement;

    if (category === 'wallpaper') {
        imgElement = document.getElementById('wallpaper');
        if (currentWallpaper) {
            currentWallpaper.src = '';
        }
    } else if (category === 'flooring') {
        imgElement = document.getElementById('flooring');
        if (currentFlooring) {
            currentFlooring.src = '';
        }
    } else {
        imgElement = document.getElementById('background');
        if (currentBackground) {
            currentBackground.src = '';
        }
    }

    if (!imgElement) return;

    imgElement.src = item.dataset.dropImage;
    imgElement.style.left = item.dataset.fixedLocationLeft || '0px';
    imgElement.style.top = item.dataset.fixedLocationTop || '0px';

    if (category === 'wallpaper') {
        currentWallpaper = imgElement;
    } else if (category === 'flooring') {
        currentFlooring = imgElement;
    } else {
        currentBackground = imgElement;
    }
}

function loadWallpaperFlooring() {
    fetch('wallfloor.json')
        .then(response => response.json())
        .then(data => {
            const allTab = document.getElementById('AllWallpaperFlooring');
            if (!allTab) {
                console.error('AllWallpaperFlooring element not found');
                return;
            }
            allTab.innerHTML = ''; // Clear the container

            data.forEach(item => {
                const itemContainer = document.createElement('div');
                itemContainer.className = 'catalog-item';
                itemContainer.dataset.category = item.category;
                itemContainer.dataset.collection = item.collection ? item.collection.toLowerCase() : '';
                itemContainer.dataset.colors = JSON.stringify(item.colors ? item.colors.map(color => color.toLowerCase()) : []);

                collectionsWallpaperFlooring.add(item.collection ? item.collection.toLowerCase() : '');
                (item.colors || []).forEach(color => colorsWallpaperFlooring.add(color.toLowerCase()));
                categoriesWallpaperFlooring.add(item.category.toLowerCase());

                const img = document.createElement('img');
                img.id = item.name;
                img.src = 'images/wallfloor/' + item.catalogImage;
                img.alt = item.name;
                img.dataset.dropImage = 'images/wallfloor/' + item.views[2]; // Use the "large" view
                img.dataset.fixedLocationLeft = item.fixedLocationLeft;
                img.dataset.fixedLocationTop = item.fixedLocationTop;
                img.dataset.source = 'catalog';
                img.dataset.category = item.category;
                img.onclick = () => setBackground(img);

                const name = document.createElement('p');
                name.textContent = item.name;

                itemContainer.appendChild(img);
                itemContainer.appendChild(name);

                allTab.appendChild(itemContainer);
            });

            loadCollectionsWallpaperFlooring([...collectionsWallpaperFlooring]);
            loadColorsWallpaperFlooring([...colorsWallpaperFlooring]);
            loadCategoriesWallpaperFlooring([...categoriesWallpaperFlooring]);

            filterItemsWallpaperFlooring(); // Initialize the filter on load
        })
        .catch(error => console.error('Error fetching JSON:', error));
}

function loadCollectionsWallpaperFlooring(collections) {
    const collectionButtonsContainer = document.getElementById('collectionsDropdownWallpaperFlooring');
    collectionButtonsContainer.innerHTML = '';

    const sortedCollections = Array.from(collections).sort();

    sortedCollections.forEach(collection => {
        if (collection.trim() === '') return;
        const button = document.createElement('label');
        button.className = 'collection-button';
        button.innerHTML = `<input type="checkbox" value="${collection}" onclick="setActiveCollectionWallpaperFlooring('${collection}', this.checked)"> ${collection}`;
        collectionButtonsContainer.appendChild(button);
    });
}

function loadColorsWallpaperFlooring(colors) {
    const colorButtonsContainer = document.getElementById('colorsDropdownWallpaperFlooring');
    colorButtonsContainer.innerHTML = '';

    const sortedColors = Array.from(colors).sort();

    sortedColors.forEach(color => {
        if (color.trim() === '') return;
        const button = document.createElement('label');
        button.className = 'color-button';
        button.innerHTML = `<input type="checkbox" value="${color}" onclick="setActiveColorWallpaperFlooring('${color}', this.checked)"> ${color}`;
        colorButtonsContainer.appendChild(button);
    });
}

function loadCategoriesWallpaperFlooring(categories) {
    const categoryButtonsContainer = document.getElementById('categoriesDropdownWallpaperFlooring');
    categoryButtonsContainer.innerHTML = '';

    const sortedCategories = Array.from(categories).sort();

    sortedCategories.forEach(category => {
        if (category.trim() === '') return;
        const button = document.createElement('label');
        button.className = 'category-button';
        button.innerHTML = `<input type="checkbox" value="${category}" onclick="setActiveCategoryWallpaperFlooring('${category}', this.checked)"> ${category}`;
        categoryButtonsContainer.appendChild(button);
    });
}

function resetAllFiltersWallpaperFlooring() {
    activeCollectionsWallpaperFlooring.clear();
    activeColorsWallpaperFlooring.clear();
    activeCategoriesWallpaperFlooring.clear();
    document.getElementById('collectionsButtonWallpaperFlooring').textContent = 'Collections';
    document.getElementById('colorsButtonWallpaperFlooring').textContent = 'Colors';
    document.getElementById('categoriesButtonWallpaperFlooring').textContent = 'Category';

    const checkboxes = document.querySelectorAll('#filtersContainerWallpaperFlooring input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);

    const dropdowns = document.querySelectorAll('#filtersContainerWallpaperFlooring .dropdown-content');
    dropdowns.forEach(dropdown => dropdown.style.display = 'none');

    filterItemsWallpaperFlooring(); // Reapply filter
}

function filterItemsWallpaperFlooring() {
    const items = document.querySelectorAll('#AllWallpaperFlooring .catalog-item');
    items.forEach(item => {
        const itemColors = item.dataset.colors ? JSON.parse(item.dataset.colors) : [];
        const itemCollections = item.dataset.collection ? item.dataset.collection.split(',') : [];
        const itemCategory = item.dataset.category ? item.dataset.category.toLowerCase() : '';

        const matchesCollection = activeCollectionsWallpaperFlooring.size === 0 || itemCollections.some(collection => activeCollectionsWallpaperFlooring.has(collection.toLowerCase()));
        const matchesColor = activeColorsWallpaperFlooring.size === 0 || itemColors.some(color => activeColorsWallpaperFlooring.has(color.toLowerCase()));
        const matchesCategory = activeCategoriesWallpaperFlooring.size === 0 || activeCategoriesWallpaperFlooring.has(itemCategory);

        if (matchesCollection && matchesColor && matchesCategory) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });

    searchItemsWallpaperFlooring(); // Apply search filter if any search term is present
}

function searchItemsWallpaperFlooring() {
    const searchTerm = document.getElementById('searchInputWallpaperFlooring').value.toLowerCase();
    const items = document.querySelectorAll('#AllWallpaperFlooring .catalog-item');
    items.forEach(item => {
        const itemName = item.querySelector('p') ? item.querySelector('p').textContent.toLowerCase() : '';
        const itemCollection = item.dataset.collection ? item.dataset.collection.toLowerCase().split(',') : [];
        const itemColors = item.dataset.colors ? JSON.parse(item.dataset.colors).map(color => color.toLowerCase()) : [];
        const itemCategory = item.dataset.category ? item.dataset.category.toLowerCase() : '';

        const matchesCollection = activeCollectionsWallpaperFlooring.size === 0 || itemCollection.some(collection => activeCollectionsWallpaperFlooring.has(collection));
        const matchesColor = activeColorsWallpaperFlooring.size === 0 || itemColors.some(color => activeColorsWallpaperFlooring.has(color));
        const matchesCategory = activeCategoriesWallpaperFlooring.size === 0 || activeCategoriesWallpaperFlooring.has(itemCategory);

        if (itemName.includes(searchTerm) && matchesCollection && matchesColor && matchesCategory) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function setActiveCategoryWallpaperFlooring(category, isActive) {
    if (isActive) {
        activeCategoriesWallpaperFlooring.add(category.toLowerCase());
    } else {
        activeCategoriesWallpaperFlooring.delete(category.toLowerCase());
    }

    const categoryButton = document.getElementById('categoriesButtonWallpaperFlooring');
    if (activeCategoriesWallpaperFlooring.size === 0) {
        categoryButton.textContent = 'Category';
    } else {
        categoryButton.textContent = `Category: ${[...activeCategoriesWallpaperFlooring].join(', ')}`;
    }

    filterItemsWallpaperFlooring();
}

function setActiveCollectionWallpaperFlooring(collection, isActive) {
    if (isActive) {
        activeCollectionsWallpaperFlooring.add(collection.toLowerCase());
    } else {
        activeCollectionsWallpaperFlooring.delete(collection.toLowerCase());
    }

    const collectionButton = document.getElementById('collectionsButtonWallpaperFlooring');
    if (activeCollectionsWallpaperFlooring.size === 0) {
        collectionButton.textContent = 'Collections';
    } else {
        collectionButton.textContent = `Collections: ${[...activeCollectionsWallpaperFlooring].join(', ')}`;
    }

    filterItemsWallpaperFlooring();
}

function setActiveColorWallpaperFlooring(color, isActive) {
    if (isActive) {
        activeColorsWallpaperFlooring.add(color.toLowerCase());
    } else {
        activeColorsWallpaperFlooring.delete(color.toLowerCase());
    }

    const colorButton = document.getElementById('colorsButtonWallpaperFlooring');
    if (activeColorsWallpaperFlooring.size === 0) {
        colorButton.textContent = 'Colors';
    } else {
        colorButton.textContent = `Colors: ${[...activeColorsWallpaperFlooring].join(', ')}`;
    }

    filterItemsWallpaperFlooring();
}

function loadBackgrounds() {
    fetch('backgrounds.json')
        .then(response => response.json())
        .then(data => {
            const allTab = document.getElementById('AllBackgrounds');
            allTab.innerHTML = ''; // Clear the container

            data.forEach(item => {
                const itemContainer = document.createElement('div');
                itemContainer.className = 'catalog-item';

                const img = document.createElement('img');
                img.id = item.name;
                img.src = 'images/backgrounds/' + item.catalogImage;
                img.alt = item.name;
                img.dataset.dropImage = 'images/backgrounds/' + item.dropImage;
                img.onclick = () => setBackground(img);

                const name = document.createElement('p');
                name.textContent = item.name;

                itemContainer.appendChild(img);
                itemContainer.appendChild(name);

                allTab.appendChild(itemContainer);
            });
        })
        .catch(error => console.error('Error fetching JSON:', error));
}

function searchItemsBackgrounds() {
    const searchTerm = document.getElementById('searchInputBackgrounds').value.toLowerCase();
    const items = document.querySelectorAll('#AllBackgrounds .catalog-item');
    items.forEach(item => {
        const itemName = item.querySelector('p') ? item.querySelector('p').textContent.toLowerCase() : '';
        if (itemName.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function setBackground(item) {
    const dropZone = document.getElementById('dropZone');
    const category = item.dataset.category ? item.dataset.category.toLowerCase() : null;
    let imgElement;

    if (category === 'wallpaper') {
        imgElement = document.getElementById('wallpaper');
        if (currentWallpaper) {
            currentWallpaper.src = '';
        }
    } else if (category === 'flooring') {
        imgElement = document.getElementById('flooring');
        if (currentFlooring) {
            currentFlooring.src = '';
        }
    } else {
        imgElement = document.getElementById('background');
        if (currentBackground) {
            currentBackground.src = '';
        }
    }

    if (!imgElement) return;

    imgElement.src = item.dataset.dropImage;
    imgElement.style.left = item.dataset.fixedLocationLeft || '0px';
    imgElement.style.top = item.dataset.fixedLocationTop || '0px';

    if (category === 'wallpaper') {
        currentWallpaper = imgElement;
    } else if (category === 'flooring') {
        currentFlooring = imgElement;
    } else {
        currentBackground = imgElement;
    }
}

function loadItems(data) {
    const allTab = document.getElementById('AllItems');

    data.forEach(item => {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'catalog-item';
        itemContainer.dataset.category = item.category;
        itemContainer.dataset.collection = item.collection ? item.collection.toLowerCase() : '';
        itemContainer.dataset.colors = JSON.stringify(item.colors ? item.colors.map(color => color.toLowerCase()) : []);
        itemContainer.dataset.footprint = item.footprint ? item.footprint.toLowerCase() : '';

        collections.add(item.collection ? item.collection.toLowerCase() : '');
        (item.colors || []).forEach(color => colors.add(color.toLowerCase()));
        categories.add(item.category.toLowerCase());
        footprints.add(item.footprint.toLowerCase());

        const img = document.createElement('img');
        img.id = item.name;
        img.src = 'images/items/' + item.catalogImage;
        img.alt = item.name;
        img.draggable = true;
        img.dataset.dropImage = 'images/items/' + item.views[0];
        img.dataset.views = JSON.stringify(item.views.map(view => 'images/items/' + view));
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
    loadCategories([...categories]);
    loadFootprints([...footprints]);

    filterItems(); // Initialize the filter on load
}

document.getElementById('checkboxGridWallpaper').addEventListener('change', (event) => {
    const gridWallpaper = document.getElementById('gridWallpaper');
    gridWallpaper.style.display = event.target.checked ? 'block' : 'none';
});

document.getElementById('checkboxGridFlooring').addEventListener('change', (event) => {
    const gridFlooring = document.getElementById('gridFlooring');
    gridFlooring.style.display = event.target.checked ? 'block' : 'none';
});
