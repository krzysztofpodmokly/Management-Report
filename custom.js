/*============================================
                    CLAIM CONTROLLER
==============================================*/
var ClaimController = (function () {

    // Function constructor created for multiple claims
    var Claim = function (id, apu, orgaloc, customer, project, description, vim, ppb) {
        this.id = id
        this.apu = apu;
        this.orgaloc = orgaloc;
        this.customer = customer;
        this.project = project;
        this.description = description;
        this.vim = vim;
        this.ppb = ppb;
    };

    var data = {
        customerClaim: [],
        totals: {
            claimsQuantity: 0,
            ppb: 0
        }
    };

    var calcIndicators = function () {
        var numberOfClaims;

        // Total number of customer claims
        numberOfClaims = data.customerClaim.length;

        data.totals.claimsQuantity = numberOfClaims;


    };

    var calculatePPB = function () {
        var sum = 0;

        for (var i = 0, l = data.customerClaim.length; i < l; i++) {
            var obj = data.customerClaim[i];
            sum += obj.ppb;
        };

        data.totals.ppb = sum;

    }



    return {
        addItem: function (ident, apu, org, cust, proj, desc, vim, ppb) {
            var newItem, ID;
            if (data.customerClaim.length > 0) {
                ID = data.customerClaim[data.customerClaim.length - 1].id + 1;
            } else {
                ID = 0;
            }

            newItem = new Claim(ID, apu, org, cust, proj, desc, vim, ppb);

            data.customerClaim.push(newItem);

            // Calculate indicators after each item add
            calcIndicators();
            calculatePPB();

            return newItem;

        },

        deleteItem: function (id) {
            var ids, index;

            // Mapping all items from data.customerClaim in order to receive new array
            ids = data.customerClaim.map(function (current) {
                return current.id
            });

            // Receiving position of id in an array which will be deleted
            index = ids.indexOf(id);

            // Using splice method to remove item
            if (index > -1) {
                data.customerClaim.splice(index, 1);
            }

            // Calculate indicators after each item delete
            calcIndicators();
            calculatePPB();
        },



        returnIndicators: function () {
            return {
                numberOfClaims: data.totals.claimsQuantity,
                ppb: data.totals.ppb
            }
        },

        testing: function () {
            console.log(data);
        }
    }

})();


/*============================================
                    UI CONTROLLER
==============================================*/
var UIController = (function () {
    var Strings = {
        submitBtn: '.submit-btn',
        inputApu: '.apu',
        inputOrgaloc: '.orgaloc',
        inputCustomer: '.customer',
        inputProject: '.project',
        inputDefectDescription: '.defect-desc',
        inputPPB: '.ppb',
        inputVIM: '.vim',
        dataContainer: '.data__container',
        removeBtn: '.item__remove',
        numberOfClaims: '.claims-qty',
        amountOfPPB: '.ppb-container--ppb'


    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i]);
        }
    }

    return {
        getInputData: function () {
            return {
                apu: document.querySelector(Strings.inputApu).value,
                orgaloc: document.querySelector(Strings.inputOrgaloc).value,
                customer: document.querySelector(Strings.inputCustomer).value,
                project: document.querySelector(Strings.inputProject).value,
                defectDesc: document.querySelector(Strings.inputDefectDescription).value,
                ppb: parseFloat(document.querySelector(Strings.inputPPB).value),
                vim: document.querySelector(Strings.inputVIM).value

            }
        },

        //obj parameter which represents function constructor
        addItem: function (obj) {
            var html, newHTML, element;

            // Getting HTML template which will be used for adding multiple claims
            html = '<div class="item" id="item-$id$"><div class="item__apu">$apu$</div><div class="item__orgaloc">$orgaloc$</div><div class="item__customer">$customer$</div><div class="item__project">$project$</div><div class="item__defect">$description$</div><div class="item__ppb">$ppb$</div><div class="item__vim">$vim$</div><div class="item__remove"><button class="remove-btn">&otimes;</button></div></div>';

            //class="item" -> parentNode - > <div class="data__container">
            element = Strings.dataContainer;

            newHTML = html.replace('$id$', obj.id);
            newHTML = newHTML.replace('$apu$', obj.apu);
            newHTML = newHTML.replace('$orgaloc$', obj.orgaloc);
            newHTML = newHTML.replace('$customer$', obj.customer);
            newHTML = newHTML.replace('$project$', obj.project);
            newHTML = newHTML.replace('$description$', obj.description);
            newHTML = newHTML.replace('$ppb$', obj.ppb);
            newHTML = newHTML.replace('$vim$', obj.vim);

            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        clearInputFields: function () {
            var inputNodes, textNodes, transformNodes;
            // Get list of all HTML inputs and 
            inputNodes = document.querySelectorAll(
                Strings.inputApu + ',' +
                Strings.inputOrgaloc + ',' +
                Strings.inputCustomer + ',' +
                Strings.inputProject + ',' +
                Strings.inputDefectDescription + ',' +
                Strings.inputPPB + ',' +
                Strings.inputVIM
            );

            // Iterate through all selectors and clear inputs
            // Distinguish whether input.nodeName is SELECT or INPUT
            nodeListForEach(inputNodes, function (current) {
                if (current.nodeName === 'INPUT') {
                    return current.value = '';
                } else if (current.nodeName === 'SELECT') {
                    return current.value = 'empty';
                }

            });

            inputNodes[0].focus();

        },

        deleteItem: function (selectorID) {
            var element = document.getElementById(selectorID);

            element.parentNode.removeChild(element);
        },

        displayIndicators: function (obj) {
            document.querySelector(Strings.numberOfClaims).textContent = obj.numberOfClaims;
            document.querySelector(Strings.amountOfPPB).textContent = obj.ppb;
            
        },

        getDOMStrings: function () {
            return Strings;
        }
    };



})();


/*============================================
                    GLOBAL CONTROLLER
==============================================*/
var controller = (function (ClaimCtrl, UICtrl) {

    // Variable stores all strings from UIController
    var DOM = UICtrl.getDOMStrings();

    var updateIndicators = function () {
        var indicators = ClaimCtrl.returnIndicators();
        UICtrl.displayIndicators(indicators);
    }

    /***********************************
                ADD ITEM
    *************************************/
    document.querySelector(DOM.submitBtn).addEventListener('click', function () {
        var input, newItem;

        // 1. Getting user input and storing it in input variable
        input = UICtrl.getInputData();

        // 2. Preventing user from submitting empty fields
        if (
            (input.apu.value && input.orgaloc.value && input.customer.value && input.project.value) !== 'empty' &&
            (input.defectDesc && input.vim) !== "" &&
            input.ppb >= 0
        ) {

            // 3. Add the item to the claim controller
            //id, apu, orgaloc, customer, project, description, vim, ppb
            newItem = ClaimCtrl.addItem(0, input.apu, input.orgaloc, input.customer, input.project, input.defectDesc, input.vim, input.ppb);

            // 4. Add item to UI
            UICtrl.addItem(newItem);

            // 5. Set input values to initial values
            UICtrl.clearInputFields();

            // Updating indicators in UI
            updateIndicators();

        }

    });

    /***********************************
                DELETE ITEM
    *************************************/

    document.querySelector(DOM.dataContainer).addEventListener('click', function (event) {
        var itemID, splitID, ID;

        // Click on 'remove-btn' class to traverse to item-1
        itemID = event.target.parentNode.parentNode.id; //<div class="item" id="item-1">
        console.log(itemID);

        //if statement prevents from clicking anywhere in row to delete an item
        //only button can remove an item
        if (itemID) {
            //item-1
            splitID = itemID.split('-'); //splitID = ['item', '1']
            ID = parseInt(splitID[1]);
            //        console.log(typeof ID);

            // 1. Delete item from data structure
            ClaimCtrl.deleteItem(ID);

            // 2. Delete item from UI
            UICtrl.deleteItem(itemID);

            // Updating indicators in UI
            updateIndicators();
        }





    });

    return {
        init: function () {
            UICtrl.displayIndicators({
                numberOfClaims: 0,
                ppb: 0
            })

        }
    }


})(ClaimController, UIController);

controller.init();