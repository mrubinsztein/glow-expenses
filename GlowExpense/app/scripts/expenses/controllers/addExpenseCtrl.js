'use strict';

angular.module('Expenses')
    .controller('AddExpenseCtrl', ['$scope', '$location', 'addExpensesTitle', 'addExpensesButtonLabel', 'reportsSharingSvc',
        'expensesRepositorySvc', 'editSaveExpenseDialogSvc', 'getIdFromLocationSvc', 'reportExpensesRepositorySvc',
        'errorDialogSvc', 'errorMessageSvc', 'errorHandlerDefaultSvc', 'localStorageSvc', 'sessionToken', 'expenseSvc', 'cameraSvc',
        'invoiceImageRepositorySvc', 'cameraSelectDialog', 'validateNumbersSvc', 'baseUrlMockeyWeb', 'expensesUrl', 'imagesUrl',
        'expensePostImageSvc', '$filter',
        function ($scope, $location, addExpensesTitle, addExpensesButtonLabel, reportsSharingSvc,
          expensesRepositorySvc, editSaveExpenseDialogSvc, getIdFromLocationSvc, reportExpensesRepositorySvc,
          errorDialogSvc, errorMessageSvc, errorHandlerDefaultSvc, localStorageSvc, sessionToken, expenseSvc,
          cameraSvc, invoiceImageRepositorySvc, cameraSelectDialog, validateNumbersSvc, baseUrlMockeyWeb, expensesUrl, imagesUrl,
          expensePostImageSvc, $filter) {

            $scope.title = addExpensesTitle;
            $scope.buttonLabel = addExpensesButtonLabel;
            $scope.showErrorMessage = false;
            $scope.imageSelectedPath = null;

            $scope.expense = {};

            $scope.expense.exchangeRate = 1;

            var reportId = getIdFromLocationSvc.getFirstIdFromLocation($location.path());
            $scope.report = reportsSharingSvc.getReportById(reportId);

            $scope.takePhoto = function() {
                cameraSelectDialog.open().then(function() {
                    cameraSvc.takePhoto().then(function(result){
                        $scope.imageSelectedPath = result;
                    });
                });
            };

            $scope.save = function(form, expense) {
                var newExpense = expenseSvc.create(expense);

                function createExpenseSuccess(response, responseHeaders){
                    var headers = responseHeaders();

                    var createdExpenseId = getIdFromLocationSvc.getLastIdFromLocation(headers.location);

                    function addExpenseToReportSuccess(){

                        expense.expenseId = createdExpenseId;
                        reportsSharingSvc.expenseSharingSvc.addExpense(newExpense, $scope.report.expenseReportId);

                        editSaveExpenseDialogSvc.openSuccessSaveExpenseDialog().then(function(url){
                            $location.path(url + '/' + $scope.report.expenseReportId);
                        });
                    }

                    function postImageSuccess(){
                        reportExpensesRepositorySvc.addExpensesToReport(

                            {
                                'token': localStorageSvc.getItem(sessionToken)
                            },
                            {
                                'expenseReportId': $scope.report.expenseReportId,
                                'expenseIds': [createdExpenseId]
                            },
                            addExpenseToReportSuccess,
                            errorHandlerDefaultSvc.handleError
                        );
                    }

                  // upload image
                  if ($scope.imageSelectedPath) {
                    expensePostImageSvc.postImages($scope.imageSelectedPath,
                      localStorageSvc.getItem(sessionToken),
                      createdExpenseId
                    ).then(postImageSuccess, errorHandlerDefaultSvc.handleError, function (progress) {
                        console.log('expenses-post-image', progress);
                    });
                  }
                }

                // TODO uncomment when tested with real services with working upload image
                if(form.$valid && validateNumbersSvc.validate(expense))// && $scope.imageSelectedPath)
                {
                    newExpense.date = $filter('date')(new Date(), 'yyyy-MM-dd');
                    newExpense.originalCurrency =  expense.currency.id;
                    newExpense.contableCodeId = expense.contableCode.id;
                    newExpense.owner = localStorageSvc.getItem('userName');

                    expensesRepositorySvc.createExpense(

                        { 'token': localStorageSvc.getItem(sessionToken) },
                        newExpense,
                        createExpenseSuccess,
                        errorHandlerDefaultSvc.handleError
                    );
                }
                else
                {
                    $scope.showErrorMessage = true;
                }
            };
    }
] );
