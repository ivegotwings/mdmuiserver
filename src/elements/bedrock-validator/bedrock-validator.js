import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-helpers/validation-helper.js';
import '../bedrock-helpers/format-helper.js';
import '../bedrock-externalref-moment/bedrock-externalref-moment.js';
/**
* `bedrock-validator` Represents a component that validates the user input against a specified validation condition.
*
* @demo demo/index.html
*/
class BedrockValidator extends PolymerElement {
    static get is() {
        return "bedrock-validator";
    }

    static get properties() {
        return {
            // Indicates the pattern using which a regular expressions is passed for validation.
            pattern: {
                type: String,
                notify: true
            },

            // Indicates allowed values for pattern invalid message
            regexHint: {
                type: String,
                value: null
            },

            // Indicates an input that needs validation.
            input: {
                type: String,
                notify: true,
                observer: 'inputChanged'
            },

            // Indicates an input data type.
            inputDataType: {
                type: String
            },

            // Indicates the type of the validator. 
            // Multiple validators are passed as comma separated strings. 
            // Possible validation types are required, minLength, maxLength, range, email, pattern, decimalPrecision, timeRange, dateRange, and fileExtension. 
            // Some common validation types like required, minLength, and maxLength are directly passed as attributes. There is no need to add them in the type.
            type: {
                type: String,
                notify: true
            },

            // Indicates the type of validator to be used if the type `required` is passed as an array. You can use either this or the `type`. You cannot use both.
            typeArray: {
                type: Array,
                notify: true,
                value: function () {
                    return [];
                }
            },

            // Indicates whether or not the data is successfully validated.
            invalid: {
                type: Boolean,
                value: false,
                notify: true,
                reflectToAttribute: true
            },

            // Indicates an error message.
            errorMessage: {
                type: String,
                notify: true,
                value: ''
            },

            warningMessage: {
                type: String,
                notify: true,
                value: ''
            },

            // Indicates the minimum value allowed in the range validator.
            min: {
                type: String,
                notify: true
            },

            //Indicates the maximum value allowed in the range validator.
            max: {
                type: String
            },

            // Indicates the minimum length of the text allowed.
            minLength: {
                type: Number,
                notify: true
            },

            // Indicates the maximum length of the text allowed.
            maxLength: {
                type: Number,
                notify: true
            },

            //Indicates the decimal precision.
            precision: {
                type: Number
            },

            //Specifies whether or not the input is required.
            required: {
                type: Boolean,
                value: false
            },

            // Specifies the date format.
            dateFormat: {
                type: String
            },

            // Indicates an array of server errors.
            serverErrors: {
                type: Array,
                value: function () {
                    return [];
                },
                notify: true
            },

            // Indicates an array of validation errors.
            validationErrors: {
                type: Array,
                value: function () {
                    return [];
                },
                notify: true,
                observer: '_validationErrorsChanged'
            },

            validationWarnings: {
                type: Array,
                value: function () {
                    return [];
                },
                notify: true,
                observer: '_validationWarningsChanged'
            },

            // Specifies whether or not to show the errors.
            showError: {
                type: Boolean,
                value: false,
                notify: true
            },

            /**
              * Content development is under progress.
              */
            minInclusive: {
                type: Boolean,
                value: false
            },

            /**
              * Content development is under progress.
              */
            maxInclusive: {
                type: Boolean,
                value: false
            }
        }
    }

    connectedCallback () {
        super.connectedCallback();
        this.validate(this.input);
    }

    disconnectedCallback () {
        super.disconnectedCallback();
    }

    // Can be used to observe the input. It is invoked whenever any input is changed.
    inputChanged(input) {
        this.validate(input);
    }

    // Can be used to validate the input. It invokes the required validator based on the given validation type.
    validate(input) {
        this.errorMessage = '';
        this.validationErrors = [];
        this.validationWarnings = [];
        this.invalid = false;
        let _greaterEqual = "greater than or equal to ";
        let _greater = "greater than ";
        let _lesserEqual = "less than or equal to ";
        let _lesser = "less than ";
        let inputDataType = "";

        if (this.inputDataType) {
            inputDataType = this.inputDataType.toLowerCase();
        }
        if (this.required) {
            if (!ValidationHelper.requiredValidator(input)) {
                this.invalid = true;
                this._updateServerErrors("Required");
                this.push('validationErrors', "Required");
            }
        }

        if (inputDataType && input) {

            if (inputDataType == "boolean") {
                if (!ValidationHelper.booleanValidator(input)) {
                    this.invalid = true;
                    this.push('validationErrors', "Provide boolean value");
                }
            }
            if (inputDataType == "integer") {
                if (!ValidationHelper.integerValidator(input)) {
                    this.invalid = true;
                    this.push('validationErrors', "Provide integer value");
                }
            }
            if (inputDataType == "decimal") {
                if (!ValidationHelper.decimalValidator(input)) {
                    this.invalid = true;
                    this.push('validationErrors', "Provide decimal value");
                }
            }
            if (this.pattern) {
                if (!ValidationHelper.regexValidator(input, this.pattern)) {
                    this.invalid = true;
                    let msg = "Text doesn't match the required pattern.";
                    this._updateServerErrors(msg);
                    if(this.regexHint){
                        msg += " Hint - "+this.regexHint
                    }
                    this.push('validationErrors', msg);
                }
            }
            if (inputDataType == "decimal" && this.precision) {
                if (!ValidationHelper.decimalPrecisionValidator(input, this.precision)) {
                    this.invalid = true;
                    this.push('validationErrors', "Value should have a precision of " + this.precision);
                }
            }
            if (inputDataType == "date" || inputDataType == "datetime") {
                //Convert date and do rest of the process
                input = FormatHelper.convertFromISODateTime(input, this.inputDataType, this.dateFormat);

                this.min = FormatHelper.convertFromISODateTimeToClientFormat(this.min, inputDataType);
                this.max = FormatHelper.convertFromISODateTimeToClientFormat(this.max, inputDataType);

                if (!ValidationHelper.dateTimeValidator(input, this.inputDataType.toLowerCase(), this.dateFormat)) {
                    this.invalid = true;
                    this.push('validationErrors', "Provide valid date");
                }
                //TODO:: WORK HERE
                let message = "";
                if (this.min && this.max && (!ValidationHelper.dateRangeValidator(input, this.dateFormat, this.min, this.max, this.minInclusive, this.maxInclusive))) {
                    this.invalid = true;
                    message = "Value should be " + (this.minInclusive ? _greaterEqual : _greater) + ValidationHelper.getDateByFormat(this.min, this.dateFormat) + " and " +
                        (this.maxInclusive ? _lesserEqual : _lesser) + ValidationHelper.getDateByFormat(this.max, this.dateFormat);
                    this.push('validationErrors', message);
                    this._updateServerErrors(message);
                }
                else if (!this.min && this.max && (!ValidationHelper.dateRangeValidator(input, this.dateFormat, '', this.max, this.minInclusive, this.maxInclusive))) {
                    this.invalid = true;
                    message = "Value should be " + (this.maxInclusive ? _lesserEqual : _lesser) + this.max;
                }
                else if (this.min && !this.max && (!ValidationHelper.dateRangeValidator(input, this.dateFormat, this.min, '', this.minInclusive, this.maxInclusive))) {
                    this.invalid = true;
                    message = "Value should be " + (this.minInclusive ? _greaterEqual : _greater) + this.min;
                }
            }
            if (this.minLength) {
                let validateInput = ValidationHelper.minLengthValidator(input, this.minLength);
                if (!validateInput || Array.isArray(validateInput)) {
                    let errorMessage = "Length should not be smaller than " + this.minLength
                    this.invalid = true;
                    if (Array.isArray(input)) {
                        errorMessage += " for values at position " + validateInput.join(" , ");
                    }
                    this.push('validationErrors', errorMessage);
                }
            }
            if (this.maxLength) {
                let validateInput = ValidationHelper.maxLengthValidator(input, this.maxLength);
                if (!validateInput || Array.isArray(validateInput)) {
                    let errorMessage = "Length should not be greater than " + this.maxLength
                    this.invalid = true;
                    if (Array.isArray(input)) {
                        errorMessage += " for values at position " + validateInput.join(" , ");
                    }
                    this.push('validationErrors', errorMessage);
                }
            }

            // Range validation                
            if ((inputDataType == "decimal" || inputDataType == "integer") && (this.min || this.max)) {
                let message = "";
                if (this.min && this.max && (!ValidationHelper.numberRangeValidator(input, this.min, this.max, this.minInclusive, this.maxInclusive))) {
                    this.invalid = true;
                    message = "Value should be " + (this.minInclusive ? _greaterEqual : _greater) + this.min + " and " + (this.maxInclusive ? _lesserEqual : _lesser) + this.max;
                } else if (!this.min && this.max && (!ValidationHelper.numberRangeValidator(input, '', this.max, this.minInclusive, this.maxInclusive))) {
                    this.invalid = true;
                    message = "Value should be " + (this.maxInclusive ? _lesserEqual : _lesser) + this.max;
                } else if (this.min && !this.max && (!ValidationHelper.numberRangeValidator(input, this.min, '', this.minInclusive, this.maxInclusive))) {
                    this.invalid = true;
                    message = "Value should be " + (this.minInclusive ? _greaterEqual : _greater) + this.min;
                }

                if (message != "") {
                    this._updateServerErrors(message);
                    this.push('validationErrors', message);
                }
            }
        }

        let types;
        if (this.type) {
            types = this.type.split(",");
        } else if (this.typeArray) {
            types = this.typeArray;
        }
        if (types && types.length > 0) {
            for (let i = 0; i < types.length; i++) {
                let invalid = false;
                if (types[i] == 'required' && !this.required) {
                    if (!ValidationHelper.requiredValidator(input)) {
                        this.invalid = true;
                        this.push('validationErrors', "Required");
                    }
                } else if (input) {
                    switch (types[i]) {
                        case 'email': {
                            invalid = !ValidationHelper.emailValidator(input);
                            if (invalid) {
                                this.push('validationErrors', "Invalid Email");
                            }
                            break;
                        }
                        case 'fileExtension': {
                            let allowedFiles = [".png", ".doc", ".docx", ".pdf", ".xls", ".xlsx", ".txt"];
                            invalid = !ValidationHelper.fileExtensionValidator(input, allowedFiles);
                            if (invalid) {
                                this.push('validationErrors', "File with the given extension is not supported");
                            }
                            break;
                        }
                    }
                }
                if (invalid) {
                    this.invalid = true;
                }
            }
        }
        if (this.invalid) {
            this._refreshValidationMessages();
        }
    }
    _updateServerErrors(msg){
        if(msg && !_.isEmpty(this.serverErrors)){
            let errorIndex = this.serverErrors.indexOf(msg);
            if(errorIndex > -1){
                this.serverErrors.splice(errorIndex, 1);
            }
        }
    }
    _refreshValidationMessages() {
        //Warnings
        let warnings = this.validationWarnings;
        this.validationWarnings = [];
        this.validationWarnings = warnings;

        //Errors
        let errors = this.validationErrors;
        this.validationErrors = [];
        this.validationErrors = errors;
    }

    _validationErrorsChanged() {
        this._validationMessagesChanged(this.validationErrors);
    }

    _validationWarningsChanged() {
        this._validationMessagesChanged(this.validationWarnings, false);
    }

    _validationMessagesChanged(validationMessages, isError = true) {
        let message = "";
        if (this.showError) {
            for (let i = 0; i < validationMessages.length; i++) {
                message += validationMessages[i] + ". "
            }
        }

        if (isError) {
            this.errorMessage = message
        } else {
            this.warningMessage = message;
        }

        if (validationMessages && validationMessages.length) {
            this.invalid = true;
        }
        else {
            this.invalid = false;
        }
    }

}
customElements.define(BedrockValidator.is, BedrockValidator);
