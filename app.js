// Model controller
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calculatePercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = ((this.value / totalIncome) * 100).toFixed(1);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type]
                    [data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
                
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            //console.log(ids);
            index = ids.indexOf(parseInt(id));
            //console.log(index);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the persentage of income spent
            if (data.totals.inc > 0) {
                data.percentage = ((data.totals.exp / data.totals.inc) * 100).toFixed(1);
            } else {
                data.percentage = -1;
            }
        },
        
        calculatePercentages: function() {
            // get income
            // for each expense, do exp/income
            var income = data.totals.inc;
            data.allItems.exp.forEach(function(current) {
                current.calculatePercentage(income);
            });
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPerc;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        testing: function() {
            console.log(data);
        }
    }
    
})();

var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
            
    var formatNumber = function(num, type) {
        /****
         * + or - before number
         * exactly 2 decimal places
         * comma every 3 places
         *
         * Examples:
         *  inc 2310.4567 -> + 2,310.46
         *  exp 2000      -> - 2,000.00
         ****/
        var numSplit, integer, decimal, sign;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        integer = numSplit[0];
        // add commas for ANY number
        if (integer.length > 6) {
            integer = integer.substr(0, integer.length - 6) + ','
                    + integer.substr(integer.length - 6, 3) + ','
                    + integer.substr(integer.length - 3, 3);
        } else if (integer.length > 3) {
            integer = integer.substr(0, integer.length - 3) + ','
                    + integer.substr(integer.lengh - 3, 3);
        } else {}

        decimal = numSplit[1];

        ;

        return (type === 'exp' ? '-' : '+') + ' ' + integer + '.' + decimal;
    };
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element, fieldsArr;
            // Create HTML strings with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder with actual data
            newHtml = html.replace('%id%', obj.id)
                    .replace('%description%', obj.description)
                    .replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);     
        },
        
        clearFields: function() {
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputDescription 
               + ', ' + DOMstrings.inputValue);
            //console.log(fields);
            //fields.slice();
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArr[0].focus();      
        },
        
        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,
                                                                obj.budget >= 0 ? 'inc': 'exp');
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,
                                                                                      'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,
                                                                                      'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
              document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentages) {
            var fields;
            // querySelectorAll returns a nodeList
            fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            // forEach exp-{i} id, place the corresponding percentages[i] value.
            
            /* could do again:
             * var fieldsArr = Array.prototype.slice.call(fields); // but this is hacky...
             * Lets instead create our own forEach function
             *   using the power of first-class functions */
            
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = percentages[index] + '---';
                }
            });
        },
        
        displayDate : function() {
            var now, months, month, year;
            
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
            month = months[now.getMonth()];
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = month + ', ' + year;
        },
        
        changedType : function() {
            var fields;
            
            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
            
        },
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
    
})();

var controller = (function(budgetCtrl, UICtrl) {

    var setUpEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputButton)
        .addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            //console.log(event);
            if (event.keyCode === 13 || event.which === 13) {
                //console.log('Enter was pressed.');
                ctrlAddItem();
            }     
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        // 3. Display the budget on the UI
        //console.log(budget);
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentages = function() {
        //console.log('update percentage');
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
            //console.log(percentages);
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function() {
        //console.log('ctrlAddItem called');
        var input, newItem;
        // 1. Get filled input data
        input = UICtrl.getInput();
        //console.log(input);
        if (input.description !== "" && !isNaN(input.value)
                && input.value > 0)  {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type,
                input.description, input.value);
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            // 4. Clear the fields after input
            UICtrl.clearFields();
            // 5. Calculate and update budget
            updateBudget();
            // 6. Calculate and update percentages
            updatePercentages();
        }
    };
    
    // Dealing with event bubbling, with event delegation.
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = splitID[1];
                //console.log('type to delete: ');
                //console.log(type);
                //console.log('ID to delete');
                //console.log(ID);
            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budget
            updateBudget();
            // 4. Calculate and update percentages
            updatePercentages();
        }
    };
    
    return {
        init: function() {
            console.log('Application has stated.');
            UICtrl.displayDate();
            UICtrl.displayBudget({budget: 0, totalInc: 0, totalExp: 0, percentage: -1})
            setUpEventListeners();
        }
    }
    
})(budgetController, UIController);

controller.init();

var btest = budgetController.testing;