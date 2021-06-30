import {
  BookmarkIcon,
  Button,
  ButtonProps,
  Form,
  Input,
  MenuItemProps,
  Toolbar,
  TrashCanIcon,
  MenuIcon,
  ToolbarMenuItemProps,
  ToolbarItemProps,
  FormFieldProps,
  FormInput,
  Dialog,
} from "@fluentui/react-northstar";
import React, { useState } from "react";
import { BiHide } from "react-icons/bi";
import { GiBookshelf } from "react-icons/gi";
import Collection from "../utils/collection";

const NewCollectionDialog = ({
  open,
  setOpen,
  onAdd,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAdd: (name: string) => void;
}) => {
  const [name, setName] = useState<string>();

  const content = (
    <Form
      fields={
        [
          {
            label: "Collection Name",
            required: true,
            control: {
              as: Input,
              value: name,
              fluid: true,
              onChange: (_: any, p: any) => setName(p?.value),
              showSuccessIndicator: false,
            },
          },
        ] as FormFieldProps[]
      }
    />
  );

  return (
    <Dialog
      header="New Collection"
      confirmButton="Add"
      content={content}
      onConfirm={() => {
        setOpen(false);
        if (name) onAdd(name);
      }}
      onCancel={() => {
        setOpen(false);
      }}
      open={open}
    />
  );
};

type CollectionToolbarProps = {
  onChangeCollection: (c?: Collection) => void;
  allCollections: Collection[];
  setAllCollections: (cs: Collection[]) => void;
};

const CollectionToolbar = ({
  onChangeCollection,
  allCollections,
  setAllCollections,
}: CollectionToolbarProps) => {
  const [collection, setCollection] = useState<Collection>();
  const [menuOpenCollections, setMenuOpenCollections] = useState<boolean>();
  const [menuOpenNewCollection, setMenuOpenNewCollection] = useState<boolean>(
    false
  );

  const changeCollection = (c?: Collection) => {
    setCollection(c);
    onChangeCollection(c);
  };

  const collectionsMoreMenu = [
    {
      key: "new-collection",
      content: "New Collection",
      icon: <BookmarkIcon />,
      onClick: () => {
        setMenuOpenNewCollection(true);
      },
    },
    { key: "divider-1", kind: "divider" },
    ...((arr: MenuItemProps[]) => {
      return arr.length > 0
        ? [...arr, { key: "divider-2", kind: "divider" }]
        : [];
    }) // apppend 'divider' if length > 0
      .call(
        null,
        allCollections
          .filter((c) => !c.show)
          .map(
            (c) =>
              ({
                key: `open-${c.name}`,
                content: c.name,
                icon: c.getIcon(),
                onClick: () => {
                  c.show = true;
                  c.serialize();
                  changeCollection(c);
                },
              } as MenuItemProps)
          )
      ),
    {
      key: "hide-collection",
      content: `Hide ${collection?.name || "Collection"}`,
      disabled: collection === undefined,
      icon: <BiHide />,
      onClick: () => {
        if (collection) {
          collection.show = false;
          collection.serialize();
          changeCollection(undefined);
        }
      },
    },
    {
      key: "remove-collection",
      content: `Delete ${collection?.name || "Collection"}`,
      disabled: collection === undefined,
      icon: <TrashCanIcon />,
      onClick: () => {
        collection?.remove();
        setAllCollections(
          allCollections.filter((c) => c.key !== collection?.key)
        );
        changeCollection(undefined);
      },
    },
  ];

  const collectionsMenu = [
    {
      key: "all",
      icon: <GiBookshelf />,
      text: true,
      content: "All",
      primary: collection === undefined,
      size: "small",
      onClick: () => changeCollection(undefined),
    },
    { key: "divider-1", kind: "divider" },
    ...allCollections
      .filter((c) => c.show)
      .map(
        (c) =>
          ({
            key: c.key,
            text: true,
            content: c.name,
            size: "small",
            icon: c.getIcon(),
            primary: collection?.key === c.key,
            onClick: () => changeCollection(c),
          } as ButtonProps)
      ),
    { key: "divider-2", kind: "divider" },
    {
      key: "more",
      text: true,
      content: "More...",
      menu: collectionsMoreMenu,
    },
  ] as ToolbarMenuItemProps[];

  const toolbarItems = [
    {
      icon: <MenuIcon />,
      menu: collectionsMenu,
      menuOpen: menuOpenCollections,
      onMenuOpenChange: (_, p) => setMenuOpenCollections(p?.menuOpen),
    },
    {
      kind: "custom",
      styles: { paddingLeft: 0 },
      content: (
        <Button
          content={collection?.name || "All"}
          styles={{ minWidth: 0 }}
          text
        />
      ),
    },
  ] as ToolbarItemProps[];

  return (
    <>
      <Toolbar
        styles={{ width: "100%" }}
        aria-label="Default"
        items={toolbarItems}
      />
      <NewCollectionDialog
        open={menuOpenNewCollection}
        setOpen={setMenuOpenNewCollection}
        onAdd={(name) => {
          if (name) {
            setAllCollections([
              ...allCollections,
              new Collection({
                name,
                key: name.toLowerCase().replace(/\W/g, "-"),
              }).serialize(),
            ]);
          }
        }}
      />
    </>
  );
};

export default CollectionToolbar;
