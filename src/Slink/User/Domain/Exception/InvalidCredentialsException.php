<?php

declare(strict_types=1);

namespace Slink\User\Domain\Exception;

class InvalidCredentialsException extends \LogicException {
  /**
   * @param mixed ...$args
   */
  public function __construct(mixed ...$args) {
    if (empty($args)) {
      $args = ['Invalid credentials'];
    }
    
    parent::__construct(...$args);
  }
}