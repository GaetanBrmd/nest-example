export class PostCreatedEvent {
  constructor(
    public readonly postId: string,
    public readonly userId: number,
    public readonly text: string,
  ) {}

  // Important to implement toString for Kafkajs serialization
  toString() {
    return JSON.stringify({
      postId: this.postId,
      userId: this.userId,
      text: this.text,
    });
  }
}
