import * as THREE from "three";
import {useId, useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Checkbox} from "@/components/ui/checkbox";
import noneAvatar from "@assets/img/none-avatar.jpg";
import {IRoomMember} from "@/types/room";
import {memberSignal, setMember} from "@bim/signals/member";
const RoomCredential = () => {
  const nameId = useId();
  const rememberId = useId();

  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);
  const onUploadAvatar = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();
    input.onchange = async (event: any) => {
      const file = event.target.files[0] as File;
      if (file && file.size > 500 * 1024) {
        setError("File size should be less than 500KB");
        setAvatar(null);
      } else if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatar(reader.result as string);
          setError("");
        };
        reader.readAsDataURL(file);
      }
    };
    input.remove();
  };
  const onSubmit = (event: any) => {
    event.preventDefault();
    memberSignal.value = {
      userId: THREE.MathUtils.generateUUID(),
      username,
      color: Math.floor(Math.random() * 16777215),
      avatar: avatar ?? undefined,
    } as IRoomMember;
    if (remember) setMember();
  };
  return (
    <div className="relative h-full w-full overflow-hidden flex items-center justify-center">
      <Card className="relative  w-[450px] shadow-xl p-3">
        <CardContent className="p-0 ">
          <form className="grid w-full items-center gap-4" onSubmit={onSubmit}>
            <div className="flex flex-col space-y-3">
              <Label htmlFor={nameId}>Name</Label>
              <Input
                id={nameId}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="flex flex-row justify-between space-y-3">
              <Button
                type="button"
                className="my-auto"
                onClick={onUploadAvatar}
              >
                Upload avatar
              </Button>
              <Avatar className="h-16 w-16">
                {avatar ? (
                  <AvatarImage src={avatar} alt="Avatar" />
                ) : (
                  <AvatarImage src={noneAvatar} alt="@room" />
                )}
                <AvatarFallback></AvatarFallback>
              </Avatar>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex items-center space-x-2">
              <Checkbox
                id={rememberId}
                checked={remember}
                onClick={() => setRemember(!remember)}
              />
              <Label
                htmlFor={rememberId}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </Label>
            </div>
            <div className="flex flex-col  space-y-3">
              <Button type="submit" className="my-auto">
                Joint Room
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomCredential;
