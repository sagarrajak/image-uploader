import { Button, CircularProgress, Box } from '@material-ui/core';
import { createStyles, Theme, makeStyles, withStyles, WithStyles } from '@material-ui/core/styles';
import { AxiosError, AxiosResponse } from "axios";
import React from "react";
import { AxiosInstance } from "./instance";
import { withSnackbar, WithSnackbarProps } from 'notistack';

const styles = (theme: Theme) =>
  createStyles({
    progress: {
      margin: theme.spacing(2),
    },
    image: {
      [theme.breakpoints.down('sm')]: {
        maxWidth: (window.innerWidth-50)+'px !important',
      },
      [theme.breakpoints.between('sm', 'md')]: {
        maxWidth: "512px !important",
      },
      [theme.breakpoints.between('md', 'lg')]: {
        maxWidth: "1024px !important",
      },
      maxWidth: (window.innerWidth-50)+'px !important',
    },
    buttonStyle: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2)
    }
  });

interface Props extends WithStyles<typeof styles>, WithSnackbarProps {
}

interface State {
  uploading: boolean,
  selectedFile: null | FileList,
}

class Main extends React.Component<Props, State> {

  public fileInputRef: HTMLInputElement | null = null;
  public imageTagRef: HTMLImageElement | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      uploading: false,
      selectedFile: null
    };
  }

  render() {
    return (<div>
      <Box>
        <input id='file' type='file' onChange={this.onChange.bind(this)} ref={el => (this.fileInputRef = el)} />
      </Box>
      <Box>
        <img className={this.props.classes.image} ref={el => (this.imageTagRef = el)} />
      </Box>
      <Box>
        <Button variant='contained' color='primary' className={this.props.classes.buttonStyle} 
            onClick={this.uploadFile.bind(this)}>Submit</Button>
        <Button variant='contained' color='secondary'  className={this.props.classes.buttonStyle}
            onClick={this.deleteFile.bind(this)}>Delete</Button>
      </Box>
      {this.state.uploading ? <CircularProgress className={this.props.classes.progress} /> : ''}
    </div>);
  }

  public onChange(event: React.FormEvent<HTMLInputElement>): void {
    const files: FileList | null = (event.target as HTMLInputElement).files;
    const reader = new FileReader();
    if (files) {
      reader.readAsDataURL(files[0]);
      reader.onload = (ev: any) => {
        if (this.imageTagRef)
          this.imageTagRef.setAttribute('src', ev.target.result);
      }
    }

    this.setState({ selectedFile: files });
  }

  public uploadFile(): void {
    if (this.state.selectedFile) {
      const formData = new FormData();
      formData.append('picture', this.state.selectedFile[0]);
      this.setState({ uploading: true });
      AxiosInstance.post('/uploadphoto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then((res: AxiosResponse) => {
        this.setState({ uploading: false, selectedFile: null });
        console.log({ res });
        if (this.fileInputRef) this.fileInputRef.value = '';
        this.props.enqueueSnackbar(`Image Uploaded  width: ${res.data.width}, height: ${res.data.height}`, { variant: 'success' });
      })
        .catch((err: AxiosError) => {
          this.setState({ uploading: false, selectedFile: null });
          console.error(err);
        });
    }
    else {
      this.props.enqueueSnackbar('No Image Selected', { variant: 'error' });
    }
  }

  public deleteFile(): void {
    this.setState({ selectedFile: null });
    if (this.fileInputRef) this.fileInputRef.value = '';
    if (this.imageTagRef) this.imageTagRef.setAttribute('src', '');
  }
}

export default withStyles(styles)(withSnackbar(Main));