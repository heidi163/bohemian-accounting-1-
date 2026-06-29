<?php
declare(strict_types=1);
namespace App\Core;

use App\Core\Exceptions\ValidationException;

class Validator {
    private array $data;
    private array $rules;
    private array $errors = [];

    public function __construct(array $data, array $rules) {
        $this->data = $data;
        $this->rules = $rules;
    }

    public static function validate(array $data, array $rules): array {
        $validator = new self($data, $rules);
        if (!$validator->passes()) {
            throw new ValidationException($validator->errors());
        }
        return $validator->validated();
    }

    public function passes(): bool {
        foreach ($this->rules as $field => $ruleStr) {
            $rules = explode('|', $ruleStr);
            $value = $this->data[$field] ?? null;

            foreach ($rules as $rule) {
                $params = [];
                if (strpos($rule, ':') !== false) {
                    [$rule, $paramStr] = explode(':', $rule, 2);
                    $params = explode(',', $paramStr);
                }

                if ($rule === 'required' && ($value === null || $value === '')) {
                    $this->addError($field, "The $field field is required.");
                    break; // stop validating other rules for this field
                }

                if ($value !== null && $value !== '') {
                    switch ($rule) {
                        case 'email':
                            if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                                $this->addError($field, "The $field must be a valid email address.");
                            }
                            break;
                        case 'numeric':
                            if (!is_numeric($value)) {
                                $this->addError($field, "The $field must be a number.");
                            }
                            break;
                        case 'min':
                            if (is_numeric($value) && $value < (float)$params[0]) {
                                $this->addError($field, "The $field must be at least {$params[0]}.");
                            } elseif (is_string($value) && strlen($value) < (int)$params[0]) {
                                $this->addError($field, "The $field must be at least {$params[0]} characters.");
                            }
                            break;
                        case 'in':
                            if (!in_array($value, $params)) {
                                $this->addError($field, "The selected $field is invalid.");
                            }
                            break;
                        case 'exists':
                            // format: exists:table,column
                            $table = $params[0];
                            $column = $params[1];
                            $count = Database::fetch("SELECT COUNT(*) as c FROM $table WHERE $column = ?", [$value])['c'];
                            if ($count == 0) {
                                $this->addError($field, "The selected $field is invalid or does not exist.");
                            }
                            break;
                    }
                }
            }
        }
        return empty($this->errors);
    }

    private function addError(string $field, string $message): void {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }

    public function errors(): array {
        return $this->errors;
    }

    public function validated(): array {
        $validated = [];
        foreach (array_keys($this->rules) as $field) {
            if (array_key_exists($field, $this->data)) {
                $validated[$field] = $this->data[$field];
            }
        }
        return $validated;
    }
}
