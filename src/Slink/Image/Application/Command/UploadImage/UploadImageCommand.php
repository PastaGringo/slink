<?php

declare(strict_types=1);

namespace Slink\Image\Application\Command\UploadImage;

use Slink\Shared\Application\Command\CommandInterface;
use Slink\Shared\Domain\ValueObject\ID;
use Slink\Shared\Infrastructure\MessageBus\EnvelopedMessage;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Validator\Constraints as Assert;

final readonly class UploadImageCommand implements CommandInterface {
  use EnvelopedMessage;
  
  private ID $id;
  
  /**
   * @param File $image
   * @param bool $isPublic
   * @param string $description
   */
  public function __construct(
    #[Assert\Image(maxSize: '5M', mimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/svg', 'image/x-icon'])]
    private File $image,
    
    private bool $isPublic = false,
    
    #[Assert\Length(max: 255)]
    private string $description = '',
  ) {
    $this->id = ID::generate();
  }
  
  /**
   * @return ID
   */
  public function getId(): ID {
    return $this->id;
  }
  
  /**
   * @return File
   */
  public function getImageFile(): File {
    return $this->image;
  }
  
  /**
   * @return bool
   */
  public function isPublic(): bool {
    return $this->isPublic;
  }
  
  /**
   * @return string
   */
  public function getDescription(): string {
    return $this->description;
  }
}
