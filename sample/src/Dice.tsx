import { type ContainerSchema, SharedMap, type ISharedMap } from "fluid-framework";
import { AzureClient, type AzureUser, type AzureClientProps } from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils";
import { type IFluidLoadable } from "@fluidframework/core-interfaces";
import { useCallback, useEffect, useState } from "react";
import "./Dice.css"

const IS_LOCAL = import.meta.env.VITE_USER_ID == undefined
  || import.meta.env.VITE_TENANT_ID == undefined
  || import.meta.env.VITE_TENANT_KEY == undefined;

const AZURE_USER: AzureUser = IS_LOCAL ? {
  // This user is set to run against a local service.
  id: "userId",
  name: "Dummy(local)"
} : {
  // This user is set to run against a remote service.
  id: import.meta.env.VITE_USER_ID,
  name: "Dummy(remote)"
};

const SERVICE_CONFIG: AzureClientProps = IS_LOCAL ? {
  // The config is set to run against a local service.
  connection: {
    type: "local",
    tokenProvider: new InsecureTokenProvider("tenantKey", AZURE_USER),
    endpoint: "https://fluid-relay.sample.test",
  }
} : {
  /** 
   * To connect to an Azure Fluid Relay tenant comment out the local serviceConfig above and uncomment the serviceConfig below.
   * Update the corresponding properties below with your tenant specific information to run against your tenant.
   */
  connection: {
    type: "remote",
    tenantId: import.meta.env.VITE_TENANT_ID, // REPLACE WITH YOUR TENANT ID
    tokenProvider: new InsecureTokenProvider(import.meta.env.VITE_TENANT_KEY /* REPLACE WITH YOUR PRIMARY KEY */, AZURE_USER),
    endpoint: "", // REPLACE WITH YOUR AZURE ENDPOINT
  }
};

// Azure Fluid Relay Client
const client = new AzureClient(SERVICE_CONFIG);

// さいころの目を保持しているキー
const DICE_VALUE_KEY = "dice-value-key";

// 「さいころの共有」のスキーマ、といっても SharedMap を持っているだけ
const DICE_SCHEMA: ContainerSchema = {
  initialObjects: { sharedMap: SharedMap }
};

// 簡易的な型ガード: ISharedMap
const isSharedMap = (loadable?: IFluidLoadable): loadable is ISharedMap => {
  return loadable != undefined
    && loadable != null
    && "get" in loadable
    && "set" in loadable;
}

// 「さいころ」を作る
const createNewDice = async () => {
  const { container } = await client.createContainer(DICE_SCHEMA);
  const initialObjects = container.initialObjects;
  if (!isSharedMap(initialObjects.sharedMap)) {
    console.error("container.initialObjects.sharedMap is not SharedMap. Why?");
    return;
  };
  initialObjects.sharedMap.set(DICE_VALUE_KEY, 1);
  return container;
}

// 共有されている「さいころ」を取得する
const loadExistingDice = async (id: string) => {
  const { container } = await client.getContainer(id, DICE_SCHEMA);
  return container;
}

// 状況に応じて「さいころ」を取得する
const getDiceMap = async () => {
  // ハッシュに何か値が設定されていたら、それをコンテナIDとみなす
  const containerId = location.hash.substring(1);

  // コンテナID が指定されていないなら作るし、
  // 指定されていれば取得する
  const container = !containerId ? await createNewDice() : await loadExistingDice(containerId);
  if (container == undefined || container == null) {
    console.error("container is undefined or null. why?");
    debugger;
    return;
  }

  // さいころを作ったなら、Relay に接続する
  if (!containerId) {
    const id = await container.attach();
    location.hash = id;
  }

  // initialObjects に ISharedMap である sharedMap があることを保証する
  if (!isSharedMap(container.initialObjects.sharedMap)) {
    console.error("container.initialObjects.sharedMap is not SharedMap. Why?");
    debugger;
    return;
  };

  // sharedMap にさいころの目があることを保証する
  if (!container.initialObjects.sharedMap.has(DICE_VALUE_KEY)) {
    console.error("sharedMap does not have dice. why?");
    debugger;
    return;
  }

  // 「さいころ」を含んでいる sharedMap を提供する
  return container.initialObjects.sharedMap;
}

// さいころ
export const Dice = () => {
  // さいころの目を含む ISharedMap
  const [diceMap, setDiceMap] = useState<ISharedMap>();

  // マウントされたら共有しているさいころを確保する
  useEffect(() => {
    getDiceMap().then((diceMap) => setDiceMap(diceMap));
  }, []);

  // 表示しているさいころの目
  const [dice, setDice] = useState<number>();

  // ISharedMap 内のさいころの目と表示しているさいころの目を同期
  useEffect(() => {
    if (diceMap == undefined) return;

    // 同期処理
    const syncDice = () => setDice(diceMap.get(DICE_VALUE_KEY));

    // 初回同期
    syncDice();

    // ISharedMap の値が変化したら同期
    diceMap.on("valueChanged", syncDice);

    // このコンポーネントがアンマウントされるとき、値変更の通知を切る
    return () => { diceMap.off("valueChanged", syncDice) };
  }, [diceMap]);

  // さいころを振る
  const handleClick = useCallback(() => {
    if (diceMap == undefined) return;

    // 振ったさいころの目を共有する
    diceMap.set(DICE_VALUE_KEY, Math.floor(Math.random() * 6) + 1);
  }, [diceMap]);

  // さいころの目がまだ得られてないなら、何も提供しない
  if (dice == undefined) return <></>

  // 「さいころ」と「振る」ボタンを提供する
  return <div className="wrapper">
    <div className="dice">{String.fromCodePoint(0x267f + dice)}</div>
    <button className="roll" onClick={handleClick}>Roll</button>
  </div>
}
