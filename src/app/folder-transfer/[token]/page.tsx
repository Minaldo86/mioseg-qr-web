import FolderTransferClient from "./ui";

type ParamsPromise = Promise<{ token: string }>;

export default async function FolderTransferPage(props: { params: ParamsPromise }) {
  const { token } = await props.params;
  return <FolderTransferClient token={token} />;
}