import React from "react";
import axios, { AxiosResponse, AxiosError } from "axios";
import { AxiosInstance } from "./instance";
interface Props { }

interface State {
  uploading: boolean
}

export class Main extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      uploading: false
    };
  }

  render() {
    return <div>
      <input type='file' onChange={this.onChange.bind(this)} /> 
      {this.state.uploading ? <h4>Uploading...</h4> : '' }
    </div>
  }

  public onChange(event: React.FormEvent<HTMLInputElement>): void {
    const files: FileList | null = (event.target as HTMLInputElement).files;
    if (files) {
      const formData = new FormData();
      formData.append('picture', files[0]);
      this.setState({ uploading: true });
      AxiosInstance.post('/uploadphoto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then((res: AxiosResponse) => {
        this.setState({ uploading: false });
        console.log({res});
      })
      .catch((err: AxiosError) => {
        this.setState({ uploading: false });
      });
    }
    else {
      console.error('No Image Found');
    }
  }
}