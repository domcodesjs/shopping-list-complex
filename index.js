/* global cuid */

// const store = {
//   items: [
//     { id: cuid(), name: 'apples', checked: false, edit: false },
//     { id: cuid(), name: 'oranges', checked: false, edit: false },
//     { id: cuid(), name: 'milk', checked: true, edit: false },
//     { id: cuid(), name: 'bread', checked: false, edit: false }
//   ],
//   hideCheckedItems: false
// };

const createStore = function () {
  if (localStorage.getItem('store')) {
    return JSON.parse(localStorage.getItem('store'));
  }

  localStorage.setItem(
    'store',
    JSON.stringify({
      items: [
        { id: cuid(), name: 'apples', checked: false, edit: false },
        { id: cuid(), name: 'oranges', checked: false, edit: false },
        { id: cuid(), name: 'milk', checked: true, edit: false },
        { id: cuid(), name: 'bread', checked: false, edit: false }
      ],
      hideCheckedItems: false
    })
  );

  return localStorage.getItem('store');
};

const store = createStore();

const editStore = function () {
  return localStorage.setItem('store', JSON.stringify(store));
};

const generateItemElement = function (item) {
  let itemTitle = `
    <span class='shopping-item ${
      item.checked ? 'shopping-item__checked' : null
    }'>${item.name}</span>
  `;

  return `
    <li class='js-item-element' data-item-id='${item.id}'>
      ${item.edit ? createEditForm(item.id, item.name) : itemTitle}
      <div class='shopping-item-controls'>
        <button class='shopping-item-toggle js-item-toggle' ${
          item.edit ? 'disabled' : null
        }>
          ${item.checked ? 'uncheck' : 'check'}
        </button>
        <button class='shopping-item-edit js-item-edit' ${
          item.edit ? 'disabled' : null
        }>
          edit
        </button>
        <button class='shopping-item-delete js-item-delete'>
          delete
        </button>
      </div>
    </li>`;
};

const createEditForm = (id, text) => {
  return `
    <form class="js-edit-form edit-form">
      <input type="text" value=${text ? text : '""'} data-item-id=${id}>
      <button type="submit">Save</button>
    </form>
  `;
};

const generateShoppingItemsString = function (shoppingList) {
  const items = shoppingList.map((item) => generateItemElement(item));
  return items.join('');
};

/**
 * Render the shopping list in the DOM
 */
const render = function () {
  // Set up a copy of the store's items in a local
  // variable 'items' that we will reassign to a new
  // version if any filtering of the list occurs.
  let items = [...store.items];
  // If the `hideCheckedItems` property is true,
  // then we want to reassign filteredItems to a
  // version where ONLY items with a "checked"
  // property of false are included.
  if (store.hideCheckedItems) {
    items = items.filter((item) => !item.checked);
  }

  /**
   * At this point, all filtering work has been
   * done (or not done, if that's the current settings),
   * so we send our 'items' into our HTML generation function
   */
  const shoppingListItemsString = generateShoppingItemsString(items);

  // setup event listner for them items

  // insert that HTML into the DOM
  return $('.js-shopping-list').html(shoppingListItemsString);
};

const addItemToShoppingList = function (itemName) {
  return store.items.push({ id: cuid(), name: itemName, checked: false });
};

const handleNewItemSubmit = function () {
  $('#js-shopping-list-form').on('submit', function (event) {
    event.preventDefault();
    const newItemName = $('.js-shopping-list-entry').val();
    $('.js-shopping-list-entry').val('');
    addItemToShoppingList(newItemName);
    editStore();
    return render();
  });
};

const handleItemCheckClicked = function () {
  $('.js-shopping-list').on('click', '.js-item-toggle', (event) => {
    const id = getItemIdFromElement(event.currentTarget);
    toggleCheck(id);
    editStore();
    return render();
  });
};

const handleItemEditSubmit = function () {
  $('.js-shopping-list').on('submit', '.js-edit-form', function (e) {
    e.preventDefault();
    const id = $(this).find('input').data('itemId');
    const inputValue = $(this).find('input').val();
    editItem(id, inputValue);
    editStore();
    return render();
  });
};

const editItem = function (id, text) {
  const item = store.items.find((item) => item.id === id);
  item.name = text;
  return (item.edit = !item.edit);
};

const handleItemEditClicked = function () {
  $('.js-shopping-list').on('click', '.js-item-edit', function (event) {
    const id = getItemIdFromElement(event.currentTarget);
    toggleEdit(id);
    return render();
  });
};

const toggleEdit = function (id) {
  const item = store.items.find((item) => item.id === id);
  return (item.edit = !item.edit);
};

const toggleCheck = function (id) {
  const item = store.items.find((item) => item.id === id);
  return (item.checked = !item.checked);
};

const getItemIdFromElement = function (item) {
  return $(item).closest('.js-item-element').data('item-id');
};

/**
 * Responsible for deleting a list item.
 * @param {string} id
 */
const deleteListItem = function (id) {
  // As with 'addItemToShoppingLIst', this
  // function also has the side effect of
  // mutating the global store value.
  //
  // First we find the index of the item with
  // the specified id using the native
  // Array.prototype.findIndex() method.
  const index = store.items.findIndex((item) => item.id === id);
  // Then we call `.splice` at the index of
  // the list item we want to remove, with
  // a removeCount of 1.
  return store.items.splice(index, 1);
};

const handleDeleteItemClicked = function () {
  // Like in `handleItemCheckClicked`,
  // we use event delegation.
  $('.js-shopping-list').on('click', '.js-item-delete', (event) => {
    // Get the index of the item in store.items.
    const id = getItemIdFromElement(event.currentTarget);
    // Delete the item.
    deleteListItem(id);
    // Render the updated shopping list.
    editStore();
    return render();
  });
};

/**
 * Toggles the store.hideCheckedItems property
 */
const toggleCheckedItemsFilter = function () {
  return (store.hideCheckedItems = !store.hideCheckedItems);
};

/**
 * Places an event listener on the checkbox
 * for hiding completed items.
 */
const handleToggleFilterClick = function () {
  return $('.js-filter-checked').click(() => {
    toggleCheckedItemsFilter();
    render();
  });
};

/**
 * This function will be our callback when the
 * page loads. It is responsible for initially
 * rendering the shopping list, then calling
 * our individual functions that handle new
 * item submission and user clicks on the
 * "check" and "delete" buttons for individual
 * shopping list items.
 */
const handleShoppingList = function () {
  render();
  handleItemEditClicked();
  handleItemEditSubmit();
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  return handleToggleFilterClick();
};

// when the page loads, call `handleShoppingList`
$(handleShoppingList);
