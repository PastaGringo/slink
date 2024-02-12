<?php

declare(strict_types=1);

namespace Slink\Image\Application\Query\GetImageById;

use Slink\Shared\Application\Query\QueryInterface;
use Symfony\Component\Validator\Constraints as Assert;

final readonly class GetImageByIdQuery implements QueryInterface {
  public function __construct(
    #[Assert\NotBlank]
    private string $id,
  ) {
  }
  
  public function getId(): string {
    return $this->id;
  }
}